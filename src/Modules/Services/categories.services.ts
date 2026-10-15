import { AppDataSource } from "../../Config/database";
import { Categories } from "../../Entities/Categories";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-");

export class CategoryService {
  private repo = AppDataSource.getRepository(Categories);
  private auditRepo = () => AppDataSource.getRepository(AuditLog);

  async getAll() {
    return this.repo.find({ order: { name: "ASC" } });
  }

  async getOne(id: string) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new Error("Category not found");
    return category;
  }

  async create(name: string, userId?: string) {
    const slug = slugify(name);

    const existing = await this.repo
      .createQueryBuilder("c")
      .where("LOWER(c.name) = LOWER(:name)", { name })
      .getOne();
    if (existing) return existing;

    const category = this.repo.create({ name: name.trim(), slug });
    await this.repo.save(category);

    await this.auditRepo().save(this.auditRepo().create({
      action: AuditAction.CREATE,
      entity: AuditEntity.CATEGORY,
      entityId: category.id,
      newValue: category as any,
      performedById: userId,
    }));

    return category;
  }

  async update(id: string, data: Partial<Categories>, userId?: string) {
    const category = await this.getOne(id);
    const previous = { ...category };

    if (data.name && data.name !== category.name) {
      category.name = data.name.trim();
      category.slug = slugify(data.name);
    }

    await this.repo.save(category);

    await this.auditRepo().save(this.auditRepo().create({
      action: AuditAction.UPDATE,
      entity: AuditEntity.CATEGORY,
      entityId: id,
      previousValue: previous as any,
      newValue: category as any,
      performedById: userId,
    }));

    return category;
  }

  async delete(id: string, userId?: string) {
    const category = await this.getOne(id);

    await this.auditRepo().save(this.auditRepo().create({
      action: AuditAction.DELETE,
      entity: AuditEntity.CATEGORY,
      entityId: id,
      previousValue: category as any,
      performedById: userId,
    }));

    await this.repo.remove(category);
    return { message: "Category deleted successfully" };
  }
}