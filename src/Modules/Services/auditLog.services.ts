import { AppDataSource } from "../../Config/database";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";

const auditRepo = () => AppDataSource.getRepository(AuditLog);

export class AuditLogService {

  // ── Get all logs ──
  async getAll(query: {
    action?: AuditAction;
    entity?: AuditEntity;
    entityId?: string;
    performedById?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  } = {}) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = auditRepo()
      .createQueryBuilder("log")
      .leftJoinAndSelect("log.performedBy", "user")
      .orderBy("log.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (query.action) qb.andWhere("log.action = :action", { action: query.action });
    if (query.entity) qb.andWhere("log.entity = :entity", { entity: query.entity });
    if (query.entityId) qb.andWhere("log.entityId = :entityId", { entityId: query.entityId });
    if (query.performedById) qb.andWhere("log.performedById = :performedById", { performedById: query.performedById });
    if (query.from) qb.andWhere("log.createdAt >= :from", { from: query.from });
    if (query.to) qb.andWhere("log.createdAt <= :to", { to: query.to });

    const [logs, total] = await qb.getManyAndCount();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Get one ──
  async getOne(id: string) {
    const log = await auditRepo().findOne({
      where: { id },
      relations: { performedBy: true },
    });
    if (!log) throw new Error("Audit log not found");
    return log;
  }

  // ── Get logs by entity ──
  async getByEntity(entity: AuditEntity, entityId: string) {
    return auditRepo().find({
      where: { entity, entityId },
      relations: { performedBy: true },
      order: { createdAt: "DESC" },
    });
  }

  // ── Get logs by user ──
  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await auditRepo().findAndCount({
      where: { performedById: userId },
      relations: { performedBy: true },
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Get recent activity ──
  async getRecentActivity(limit = 10) {
    return auditRepo().find({
      relations: { performedBy: true },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  // ── Get stats ──
  async getStats() {
    const total = await auditRepo().count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await auditRepo()
      .createQueryBuilder("log")
      .where("log.createdAt >= :today", { today })
      .getCount();

    const actionStats = await auditRepo()
      .createQueryBuilder("log")
      .select("log.action", "action")
      .addSelect("COUNT(*)", "count")
      .groupBy("log.action")
      .getRawMany();

    const entityStats = await auditRepo()
      .createQueryBuilder("log")
      .select("log.entity", "entity")
      .addSelect("COUNT(*)", "count")
      .groupBy("log.entity")
      .getRawMany();

    return {
      total,
      todayCount,
      actionStats,
      entityStats,
    };
  }

  // ── Clear old logs ──
  async clearOldLogs(daysOld: number, userId?: string) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await auditRepo()
      .createQueryBuilder()
      .delete()
      .where("createdAt < :cutoffDate", { cutoffDate })
      .execute();

    return { message: `Logs older than ${daysOld} days cleared successfully` };
  }
}