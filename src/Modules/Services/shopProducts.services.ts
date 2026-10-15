import { AppDataSource } from "../../Config/database";
import { ShopProduct } from "../../Entities/ShopProducts";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";

const productRepo = () => AppDataSource.getRepository(ShopProduct);
const auditRepo = () => AppDataSource.getRepository(AuditLog);

export class ShopProductService {

  // ── Create ──
  async create(data: Partial<ShopProduct>, userId?: string) {
    const product = productRepo().create(data);
    await productRepo().save(product);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.CREATE,
      entity: AuditEntity.SHOP_PRODUCT,
      entityId: product.id,
      newValue: product as any,
      performedById: userId,
    }));

    return product;
  }

  // ── Get all (admin) ──
  async getAll(query: { categoryId?: string; search?: string } = {}) {
    const qb = productRepo()
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .orderBy("product.order", "ASC")
      .addOrderBy("product.createdAt", "DESC");

    if (query.categoryId) qb.andWhere("product.categoryId = :categoryId", { categoryId: query.categoryId });
    if (query.search) qb.andWhere("product.name ILIKE :search", { search: `%${query.search}%` });

    return qb.getMany();
  }

  // ── Get all (public) ──
  async getPublicAll(query: { categoryId?: string; isNewArrival?: boolean; isDeal?: boolean } = {}) {
    const qb = productRepo()
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .where("product.isActive = :isActive", { isActive: true })
      .orderBy("product.order", "ASC")
      .addOrderBy("product.createdAt", "DESC");

    if (query.categoryId) qb.andWhere("product.categoryId = :categoryId", { categoryId: query.categoryId });
    if (query.isNewArrival !== undefined) qb.andWhere("product.isNewArrival = :isNewArrival", { isNewArrival: query.isNewArrival });
    if (query.isDeal !== undefined) qb.andWhere("product.isDeal = :isDeal", { isDeal: query.isDeal });

    return qb.getMany();
  }

  // ── Get one ──
  async getOne(id: string) {
    const product = await productRepo().findOne({ where: { id }, relations: { category: true } });
    if (!product) throw new Error("Shop product not found");
    return product;
  }

  // ── Update ──
  async update(id: string, data: Partial<ShopProduct>, userId?: string) {
    const product = await productRepo().findOne({ where: { id } });
    if (!product) throw new Error("Shop product not found");

    const previous = { ...product };
    Object.assign(product, data);
    await productRepo().save(product);

    await auditRepo().save(auditRepo().create({
      action: AuditAction.UPDATE,
      entity: AuditEntity.SHOP_PRODUCT,
      entityId: id,
      previousValue: previous as any,
      newValue: product as any,
      performedById: userId,
    }));

    return product;
  }

  // ── Delete ──
  async delete(id: string, userId?: string) {
    const product = await productRepo().findOne({ where: { id } });
    if (!product) throw new Error("Shop product not found");

    await auditRepo().save(auditRepo().create({
      action: AuditAction.DELETE,
      entity: AuditEntity.SHOP_PRODUCT,
      entityId: id,
      previousValue: product as any,
      performedById: userId,
    }));

    await productRepo().remove(product);
    return { message: "Shop product deleted successfully" };
  }
}