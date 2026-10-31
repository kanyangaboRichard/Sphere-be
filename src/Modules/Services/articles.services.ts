import { AppDataSource } from "../../Config/database";
import { Article, ArticleStatus } from "../../Entities/Articles";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";
import { Media } from "../../Entities/Media";
import { In } from "typeorm";

const articleRepo = () => AppDataSource.getRepository(Article);
const auditRepo = () => AppDataSource.getRepository(AuditLog);

const generateSlug = (title: string) =>
  title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
  "-" + Date.now();

export class ArticleService {

  // ── Create ──
  async create(data: Partial<Article> & { galleryMediaIds?: string[] }, userId?: string) {
    const { galleryMediaIds, ...articleData } = data;
    const slug = generateSlug(data.title!);
    const article = articleRepo().create({ ...articleData, slug });
    if (article.status === ArticleStatus.PUBLISHED && !article.publishedAt) article.publishedAt = new Date();

    if (galleryMediaIds && galleryMediaIds.length > 0) {
      article.media = await AppDataSource.getRepository(Media).findBy({ id: In(galleryMediaIds) });
    }

    await articleRepo().save(article);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.CREATE,
      entity: AuditEntity.ARTICLE,
      entityId: article.id,
      newValue: article as any,
      performedById: userId,
    }));

    return article;
  }

  // ── Get all ──
  async getAll(query: {
    status?: ArticleStatus;
    categoryId?: string;
    authorId?: string;
    isFeatured?: boolean;
    isBreaking?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = articleRepo()
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.author", "author")
      .leftJoinAndSelect("article.category", "category")
      .leftJoinAndSelect("article.coverMedia", "coverMedia")
      .orderBy("article.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (query.status) qb.andWhere("article.status = :status", { status: query.status });
    if (query.categoryId) qb.andWhere("article.categoryId = :categoryId", { categoryId: query.categoryId });
    if (query.authorId) qb.andWhere("article.authorId = :authorId", { authorId: query.authorId });
    if (query.isFeatured !== undefined) qb.andWhere("article.isFeatured = :isFeatured", { isFeatured: query.isFeatured });
    if (query.isBreaking !== undefined) qb.andWhere("article.isBreaking = :isBreaking", { isBreaking: query.isBreaking });
    if (query.search) qb.andWhere("article.title ILIKE :search", { search: `%${query.search}%` });

    const [articles, total] = await qb.getManyAndCount();

    return {
      articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Get one ──
  async getOne(id: string) {
    const article = await articleRepo().findOne({
      where: { id },
      relations: { author: true, media: true, coverMedia: true, createdBy: true, category: true }
    });
    if (!article) throw new Error("Article not found");

    // Increment view count
    await articleRepo().update(id, { viewCount: article.viewCount + 1 });

    return article;
  }

  // ── Get by slug ──
  async getBySlug(slug: string) {
    const article = await articleRepo().findOne({
      where: { slug },
      relations: { author: true, media: true, coverMedia: true, category: true },
    });
    if (!article) throw new Error("Article not found");
    return article;
  }

  // ── Update ──
  async update(id: string, data: Partial<Article> & { galleryMediaIds?: string[] }, userId?: string) {
    const article = await articleRepo().findOne({ where: { id }, relations: { media: true } });
    if (!article) throw new Error("Article not found");

    const { galleryMediaIds, ...articleData } = data;
    const previous = { ...article };
    Object.assign(article, articleData);
    if (article.status === ArticleStatus.PUBLISHED && !article.publishedAt) article.publishedAt = new Date();

    if (galleryMediaIds !== undefined) {
      article.media = galleryMediaIds.length > 0
        ? await AppDataSource.getRepository(Media).findBy({ id: In(galleryMediaIds) })
        : [];
    }

    await articleRepo().save(article);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.UPDATE,
      entity: AuditEntity.ARTICLE,
      entityId: id,
      previousValue: previous as any,
      newValue: article as any,
      performedById: userId,
    }));

    return article;
  }

  // ── Publish ──
  async publish(id: string, userId?: string) {
    const article = await articleRepo().findOne({ where: { id } });
    if (!article) throw new Error("Article not found");

    article.status = ArticleStatus.PUBLISHED;
    article.publishedAt = new Date();
    await articleRepo().save(article);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.PUBLISH,
      entity: AuditEntity.ARTICLE,
      entityId: id,
      performedById: userId,
    }));

    return article;
  }

  // ── Unpublish ──
  async unpublish(id: string, userId?: string) {
    const article = await articleRepo().findOne({ where: { id } });
    if (!article) throw new Error("Article not found");

    article.status = ArticleStatus.DRAFT;
    await articleRepo().save(article);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.UNPUBLISH,
      entity: AuditEntity.ARTICLE,
      entityId: id,
      performedById: userId,
    }));

    return article;
  }

  // ── Schedule ──
  async schedule(id: string, scheduledAt: Date, userId?: string) {
    const article = await articleRepo().findOne({ where: { id } });
    if (!article) throw new Error("Article not found");

    article.status = ArticleStatus.SCHEDULED;
    article.scheduledAt = scheduledAt;
    await articleRepo().save(article);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.UPDATE,
      entity: AuditEntity.ARTICLE,
      entityId: id,
      newValue: { scheduledAt } as any,
      performedById: userId,
    }));

    return article;
  }

  // ── Archive ──
  async archive(id: string, userId?: string) {
    const article = await articleRepo().findOne({ where: { id } });
    if (!article) throw new Error("Article not found");

    article.status = ArticleStatus.ARCHIVED;
    await articleRepo().save(article);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.ARCHIVE,
      entity: AuditEntity.ARTICLE,
      entityId: id,
      performedById: userId,
    }));

    return article;
  }

  // ── Delete ──
  async delete(id: string, userId?: string) {
    const article = await articleRepo().findOne({ where: { id } });
    if (!article) throw new Error("Article not found");

    await auditRepo().save(auditRepo().create({
      action: AuditAction.DELETE,
      entity: AuditEntity.ARTICLE,
      entityId: id,
      previousValue: article as any,
      performedById: userId,
    }));

    await articleRepo().remove(article);
    return { message: "Article deleted successfully" };
  }

  // ── Get stats ──
  async getStats() {
    const total = await articleRepo().count();
    const published = await articleRepo().count({ where: { status: ArticleStatus.PUBLISHED } });
    const draft = await articleRepo().count({ where: { status: ArticleStatus.DRAFT } });
    const scheduled = await articleRepo().count({ where: { status: ArticleStatus.SCHEDULED } });
    const inReview = await articleRepo().count({ where: { status: ArticleStatus.IN_REVIEW } });

    return { total, published, draft, scheduled, inReview };
  }
  // ── Public methods for frontend website ──
  async getPublicAll(query: {
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = articleRepo()
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.author", "author")
      .leftJoinAndSelect("article.coverMedia", "coverMedia")
      .leftJoinAndSelect("article.category", "category")
      .where("article.status = :status", { status: ArticleStatus.PUBLISHED })
      .orderBy("article.publishedAt", "DESC")
      .skip(skip)
      .take(limit);

    if (query.categoryId) qb.andWhere("article.categoryId = :categoryId", { categoryId: query.categoryId });
    if (query.search) qb.andWhere("article.title ILIKE :search", { search: `%${query.search}%` });

    const [articles, total] = await qb.getManyAndCount();

    return { articles, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPublicBySlug(slug: string) {
    const article = await articleRepo().findOne({
      where: { slug, status: ArticleStatus.PUBLISHED },
      relations: { author: true, media: true, coverMedia: true, category: true },
    });
    if (!article) throw new Error("Article not found");

    await articleRepo().update(article.id, { viewCount: article.viewCount + 1 });

    return article;
  }
}