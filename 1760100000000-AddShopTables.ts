import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShopTables1760100000000 implements MigrationInterface {
  name = "AddShopTables1760100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the two new AuditEntity values to the existing Postgres enum type
    // so audit logging for shop categories/products doesn't fail.
    await queryRunner.query(`ALTER TYPE "audit_logs_entity_enum" ADD VALUE IF NOT EXISTS 'SHOP_CATEGORY'`);
    await queryRunner.query(`ALTER TYPE "audit_logs_entity_enum" ADD VALUE IF NOT EXISTS 'SHOP_PRODUCT'`);

    await queryRunner.query(`
      CREATE TABLE "shop_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "image" character varying,
        "imagePublicId" character varying,
        "order" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_shop_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_shop_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_shop_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "shop_products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "image" character varying,
        "imagePublicId" character varying,
        "unit" character varying,
        "price" double precision NOT NULL,
        "originalPrice" double precision,
        "badge" character varying,
        "isNewArrival" boolean NOT NULL DEFAULT false,
        "isDeal" boolean NOT NULL DEFAULT false,
        "order" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "link" character varying,
        "categoryId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shop_products" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "shop_products"
      ADD CONSTRAINT "FK_shop_products_category"
      FOREIGN KEY ("categoryId") REFERENCES "shop_categories"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shop_products" DROP CONSTRAINT "FK_shop_products_category"`);
    await queryRunner.query(`DROP TABLE "shop_products"`);
    await queryRunner.query(`DROP TABLE "shop_categories"`);
  }
}