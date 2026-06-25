import { AppDataSource } from "../../Config/database";
import { Video, VideoStatus, VideoSource, VideoPlacement } from "../../Entities/Videos";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";

const videoRepo = () => AppDataSource.getRepository(Video);
const auditRepo = () => AppDataSource.getRepository(AuditLog);

export class VideoService {

  // ── Create ──
  async create(data: Partial<Video>, userId?: string) {
    const video = videoRepo().create(data);
    await videoRepo().save(video);

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.CREATE,
        entity: AuditEntity.ARTICLE,
        entityId: video.id,
        newValue: video as any,
        performedById: userId,
      })
    );

    return video;
  }

  // ── Get all ──
  async getAll(query: {
    status?: VideoStatus;
    source?: VideoSource;
    placement?: VideoPlacement;
    articleId?: string;
    isFeatured?: boolean;
    isLive?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = videoRepo()
      .createQueryBuilder("video")
      .leftJoinAndSelect("video.article", "article")
      .orderBy("video.order", "ASC")
      .addOrderBy("video.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (query.status) qb.andWhere("video.status = :status", { status: query.status });
    if (query.source) qb.andWhere("video.source = :source", { source: query.source });
    if (query.placement) qb.andWhere("video.placement = :placement", { placement: query.placement });
    if (query.articleId) qb.andWhere("video.articleId = :articleId", { articleId: query.articleId });
    if (query.isFeatured !== undefined) qb.andWhere("video.isFeatured = :isFeatured", { isFeatured: query.isFeatured });
    if (query.isLive !== undefined) qb.andWhere("video.isLive = :isLive", { isLive: query.isLive });

    const [videos, total] = await qb.getManyAndCount();

    return {
      videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Get one ──
  async getOne(id: string) {
    const video = await videoRepo().findOne({
      where: { id },
      relations: { article: true },
    });
    if (!video) throw new Error("Video not found");

    // Increment view count
    await videoRepo().update(id, { viewCount: video.viewCount + 1 });

    return video;
  }

  // ── Get featured ──
  async getFeatured() {
    return videoRepo().findOne({
      where: { isFeatured: true, status: VideoStatus.ACTIVE },
      relations: { article: true },
      order: { createdAt: "DESC" },
    });
  }

  // ── Get by placement ──
  async getByPlacement(placement: VideoPlacement) {
    return videoRepo().find({
      where: { placement, status: VideoStatus.ACTIVE },
      relations: { article: true },
      order: { order: "ASC", createdAt: "DESC" },
    });
  }

  // ── Update ──
  async update(id: string, data: Partial<Video>, userId?: string) {
    const video = await videoRepo().findOne({ where: { id } });
    if (!video) throw new Error("Video not found");

    const previous = { ...video };
    Object.assign(video, data);
    await videoRepo().save(video);

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.UPDATE,
        entity: AuditEntity.ARTICLE,
        entityId: id,
        previousValue: previous as any,
        newValue: video as any,
        performedById: userId,
      })
    );

    return video;
  }

  // ── Toggle status ──
  async toggleStatus(id: string, userId?: string) {
    const video = await videoRepo().findOne({ where: { id } });
    if (!video) throw new Error("Video not found");

    video.status =
      video.status === VideoStatus.ACTIVE
        ? VideoStatus.INACTIVE
        : VideoStatus.ACTIVE;

    await videoRepo().save(video);
    return video;
  }

  // ── Set featured ──
  async setFeatured(id: string, userId?: string) {
    // Remove existing featured
    await videoRepo().update({ isFeatured: true }, { isFeatured: false });

    const video = await videoRepo().findOne({ where: { id } });
    if (!video) throw new Error("Video not found");

    video.isFeatured = true;
    await videoRepo().save(video);

    return video;
  }

  // ── Delete ──
  async delete(id: string, userId?: string) {
    const video = await videoRepo().findOne({ where: { id } });
    if (!video) throw new Error("Video not found");

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.DELETE,
        entity: AuditEntity.ARTICLE,
        entityId: id,
        previousValue: video as any,
        performedById: userId,
      })
    );

    await videoRepo().remove(video);
    return { message: "Video deleted successfully" };
  }

  // ── Reorder ──
  async reorder(items: { id: string; order: number }[]) {
    for (const item of items) {
      await videoRepo().update(item.id, { order: item.order });
    }
    return { message: "Videos reordered successfully" };
  }
}