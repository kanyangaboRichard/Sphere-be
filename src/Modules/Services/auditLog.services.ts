import { AppDataSource } from "../../Config/database";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";
import { User } from "../../Entities/Users";

const auditRepo = () => AppDataSource.getRepository(AuditLog);

// Only these user fields ever leave the server (never password or reset tokens)
const SAFE_USER_FIELDS = ["id", "firstName", "lastName", "email", "role", "deletedAt"] as const;

type SafeUser = Pick<User, (typeof SAFE_USER_FIELDS)[number]>;

/** Strips sensitive fields from performedBy on one log or a list of logs. */
function clean<T extends AuditLog | AuditLog[]>(input: T): T {
  const list = Array.isArray(input) ? input : [input];
  for (const log of list) {
    if (log.performedBy) {
      const safe = {} as SafeUser;
      for (const f of SAFE_USER_FIELDS) (safe as Record<string, unknown>)[f] = log.performedBy[f];
      log.performedBy = safe as User;
    }
  }
  return input;
}

export type AuditLogQuery = {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entity?: AuditEntity;
  search?: string;
  from?: Date;
  to?: Date;
};

export class AuditLogService {

  // ── Paged list for the Audit Logs page (GET /api/audit-logs) ──
  // Newest first. Users in Trash still show; permanently deleted users come back as null.
  async list(q: AuditLogQuery) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 25));

    const qb = auditRepo()
      .createQueryBuilder("log")
      .withDeleted()
      // Cast both sides: performedById is varchar, users.id is uuid
      .leftJoinAndMapOne("log.performedBy", User, "u", `u.id::text = log."performedById"::text`)
      .select(["log", ...SAFE_USER_FIELDS.map((f) => `u.${f}`)])
      .orderBy("log.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (q.action) qb.andWhere("log.action = :action", { action: q.action });
    if (q.entity) qb.andWhere("log.entity = :entity", { entity: q.entity });
    if (q.from) qb.andWhere("log.createdAt >= :from", { from: q.from });
    if (q.to) qb.andWhere("log.createdAt <= :to", { to: q.to });

    if (q.search?.trim()) {
      qb.andWhere(
        `(log.notes ILIKE :s OR log."entityId" ILIKE :s OR u.email ILIKE :s
          OR (u."firstName" || ' ' || u."lastName") ILIKE :s)`,
        { s: `%${q.search.trim()}%` }
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  // ── Get all logs (older endpoint, kept for the controller) ──
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
      .withDeleted()
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
      logs: clean(logs),
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
      withDeleted: true,
    });
    if (!log) throw new Error("Audit log not found");
    return clean(log);
  }

  // ── Get logs by entity ──
  async getByEntity(entity: AuditEntity, entityId: string) {
    const logs = await auditRepo().find({
      where: { entity, entityId },
      relations: { performedBy: true },
      withDeleted: true,
      order: { createdAt: "DESC" },
    });
    return clean(logs);
  }

  // ── Get logs by user ──
  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await auditRepo().findAndCount({
      where: { performedById: userId },
      relations: { performedBy: true },
      withDeleted: true,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      logs: clean(logs),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Get recent activity ──
  async getRecentActivity(limit = 10) {
    const logs = await auditRepo().find({
      relations: { performedBy: true },
      withDeleted: true,
      order: { createdAt: "DESC" },
      take: limit,
    });
    return clean(logs);
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
  async clearOldLogs(daysOld: number, _userId?: string) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await auditRepo()
      .createQueryBuilder()
      .delete()
      .where(`"createdAt" < :cutoffDate`, { cutoffDate })
      .execute();

    return { message: `Logs older than ${daysOld} days cleared successfully` };
  }
}