import { AppDataSource } from "../../Config/database";
import { Author, AuthorStatus } from "../../Entities/Authors";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";

const authorRepo = () => AppDataSource.getRepository(Author);
const auditRepo = () => AppDataSource.getRepository(AuditLog);

export class AuthorService {

  // ── Create ──
  async create(data: Partial<Author>, userId?: string) {
    const existing = await authorRepo().findOne({ where: { email: data.email } });
    if (existing) throw new Error("Author with this email already exists");

    const author = authorRepo().create(data);
    await authorRepo().save(author);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.CREATE,
      entity: AuditEntity.AUTHOR,
      entityId: author.id,
      newValue: author as any,
      performedById: userId,
    }));

    return author;
  }

  // ── Get all ──
  async getAll(query: {
    status?: AuthorStatus;
    isColumnist?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = authorRepo()
      .createQueryBuilder("author")
      .loadRelationIdAndMap("author.articleCount", "author.articles")
      .orderBy("author.firstName", "ASC")
      .skip(skip)
      .take(limit);

    if (query.status) qb.andWhere("author.status = :status", { status: query.status });
    if (query.isColumnist !== undefined) qb.andWhere("author.isColumnist = :isColumnist", { isColumnist: query.isColumnist });
    if (query.search) qb.andWhere(
      "author.firstName ILIKE :search OR author.lastName ILIKE :search OR author.email ILIKE :search",
      { search: `%${query.search}%` }
    );

    const [authors, total] = await qb.getManyAndCount();
    return { authors, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Get one ──
  async getOne(id: string) {
    const author = await authorRepo().findOne({
      where: { id },
      relations: { articles: true },
    });
    if (!author) throw new Error("Author not found");
    return author;
  }

  // ── Update ──
  async update(id: string, data: Partial<Author>, userId?: string) {
    const author = await authorRepo().findOne({ where: { id } });
    if (!author) throw new Error("Author not found");

    const previous = { ...author };
    Object.assign(author, data);
    await authorRepo().save(author);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.UPDATE,
      entity: AuditEntity.AUTHOR,
      entityId: id,
      previousValue: previous as any,
      newValue: author as any,
      performedById: userId,
    }));

    return author;
  }

  // ── Delete ──
  async delete(id: string, userId?: string) {
    const author = await authorRepo().findOne({ where: { id } });
    if (!author) throw new Error("Author not found");

    await auditRepo().save(auditRepo().create({
      action: AuditAction.DELETE,
      entity: AuditEntity.AUTHOR,
      entityId: id,
      previousValue: author as any,
      performedById: userId,
    }));

    await authorRepo().remove(author);
    return { message: "Author deleted successfully" };
  }

  // ── Toggle status ──
  async toggleStatus(id: string, userId?: string) {
    const author = await authorRepo().findOne({ where: { id } });
    if (!author) throw new Error("Author not found");

    author.status = author.status === AuthorStatus.ACTIVE
      ? AuthorStatus.INACTIVE
      : AuthorStatus.ACTIVE;

    await authorRepo().save(author);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.UPDATE,
      entity: AuditEntity.AUTHOR,
      entityId: id,
      newValue: { status: author.status } as any,
      performedById: userId,
    }));

    return author;
  }

  // ── Get columnists ──
  async getColumnists() {
    return authorRepo().find({
      where: { isColumnist: true, status: AuthorStatus.ACTIVE },
      order: { firstName: "ASC" },
    });
  }
}