import { AppDataSource } from "../../Config/database";
import { ShopCategory } from "../../Entities/ShopCategories";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";

const categoryRepo = () => AppDataSource.getRepository(ShopCategory);
const auditRepo = () => AppDataSource.getRepository(AuditLog);

const generateSlug = (name: string) =>
  name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export class ShopCategoryService {

  // ── Create ──
  async create(data: Partial<ShopCategory>, userId?: string) {
    const existing = await categoryRepo().findOne({ where: { name: data.name } });
    if (existing) throw new Error("A shop category with this name already exists");

    const slug = data.slug || generateSlug(data.name!);
    const category = categoryRepo().create({ ...data, slug });
    await categoryRepo().save(category);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.CREATE,
      entity: AuditEntity.SHOP_CATEGORY,
      entityId: category.id,
      newValue: category as any,
      performedById: userId,
    }));

    return category;
  }

  // ── Get all (admin) ──
  async getAll() {
    return categoryRepo().find({ order: { order: "ASC", name: "ASC" } });
  }

  // ── Get all (public) ──
  async getPublicAll() {
    return categoryRepo().find({
      where: { isActive: true },
      order: { order: "ASC", name: "ASC" },
    });
  }

  // ── Get one ──
  async getOne(id: string) {
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) throw new Error("Shop category not found");
    return category;
  }

  // ── Update ──
  async update(id: string, data: Partial<ShopCategory>, userId?: string) {
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) throw new Error("Shop category not found");

    const previous = { ...category };
    Object.assign(category, data);
    await categoryRepo().save(category);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.UPDATE,
      entity: AuditEntity.SHOP_CATEGORY,
      entityId: id,
      previousValue: previous as any,
      newValue: category as any,
      performedById: userId,
    }));

    return category;
  }

  // ── Delete ──
  async delete(id: string, userId?: string) {
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) throw new Error("Shop category not found");

    await auditRepo().save(auditRepo().create({
      action: AuditAction.DELETE,
      entity: AuditEntity.SHOP_CATEGORY,
      entityId: id,
      previousValue: category as any,
      performedById: userId,
    }));

    await categoryRepo().remove(category);
    return { message: "Shop category deleted successfully" };
  }
}