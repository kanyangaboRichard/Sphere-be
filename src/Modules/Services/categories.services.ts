import { AppDataSource } from "../../Config/database";
import { Category, CategoryStatus } from "../../Entities/Categories";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";

const categoryRepo = () => AppDataSource.getRepository(Category);
const auditRepo = () => AppDataSource.getRepository(AuditLog);

const generateSlug = (name: string) =>
  name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export class CategoryService {

  // ── Create ──
  async create(data: Partial<Category>, userId?: string) {
    const existing = await categoryRepo().findOne({ where: { name: data.name } });
    if (existing) throw new Error("Category already exists");

    const slug = generateSlug(data.name!);

    const category = categoryRepo().create({ ...data, slug });
    await categoryRepo().save(category);

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.CREATE,
        entity: AuditEntity.CATEGORY,
        entityId: category.id,
        newValue: category as any,
        performedById: userId,
      })
    );

    return category;
  }

  // ── Get all ──
  async getAll(query: {
    status?: CategoryStatus;
    showInNav?: boolean;
    isFeatured?: boolean;
  } = {}) {
    const qb = categoryRepo()
      .createQueryBuilder("category")
      .loadRelationIdAndMap("category.articleCount", "category.articles")
      .orderBy("category.order", "ASC")
      .addOrderBy("category.name", "ASC");

    if (query.status) qb.andWhere("category.status = :status", { status: query.status });
    if (query.showInNav !== undefined) qb.andWhere("category.showInNav = :showInNav", { showInNav: query.showInNav });
    if (query.isFeatured !== undefined) qb.andWhere("category.isFeatured = :isFeatured", { isFeatured: query.isFeatured });

    return qb.getMany();
  }

  // ── Get one ──
  async getOne(id: string) {
    const category = await categoryRepo().findOne({
      where: { id },
      relations: { articles: true },
    });
    if (!category) throw new Error("Category not found");
    return category;
  }

  // ── Get by slug ──
  async getBySlug(slug: string) {
    const category = await categoryRepo().findOne({ where: { slug } });
    if (!category) throw new Error("Category not found");
    return category;
  }

  // ── Update ──
  async update(id: string, data: Partial<Category>, userId?: string) {
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) throw new Error("Category not found");

    const previous = { ...category };

    if (data.name && data.name !== category.name) {
      data.slug = generateSlug(data.name);
    }

    Object.assign(category, data);
    await categoryRepo().save(category);

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.UPDATE,
        entity: AuditEntity.CATEGORY,
        entityId: id,
        previousValue: previous as any,
        newValue: category as any,
        performedById: userId,
      })
    );

    return category;
  }

  // ── Delete ──
  async delete(id: string, userId?: string) {
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) throw new Error("Category not found");

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.DELETE,
        entity: AuditEntity.CATEGORY,
        entityId: id,
        previousValue: category as any,
        performedById: userId,
      })
    );

    await categoryRepo().remove(category);
    return { message: "Category deleted successfully" };
  }

  // ── Toggle status ──
  async toggleStatus(id: string, userId?: string) {
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) throw new Error("Category not found");

    category.status =
      category.status === CategoryStatus.ACTIVE
        ? CategoryStatus.INACTIVE
        : CategoryStatus.ACTIVE;

    await categoryRepo().save(category);

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.UPDATE,
        entity: AuditEntity.CATEGORY,
        entityId: id,
        newValue: { status: category.status } as any,
        performedById: userId,
      })
    );

    return category;
  }

  // ── Reorder ──
  async reorder(items: { id: string; order: number }[], userId?: string) {
    for (const item of items) {
      await categoryRepo().update(item.id, { order: item.order });
    }

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.UPDATE,
        entity: AuditEntity.CATEGORY,
        notes: "Categories reordered",
        performedById: userId,
      })
    );

    return { message: "Categories reordered successfully" };
  }
}