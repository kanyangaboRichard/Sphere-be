import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryRelation1760000000000 implements MigrationInterface {
  name = "AddCategoryRelation1760000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
   
    await queryRunner.query(`
      UPDATE "articles"
      SET "categoryId" = NULL
      WHERE "categoryId" IS NOT NULL
        AND "categoryId" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ALTER COLUMN "categoryId" TYPE uuid USING "categoryId"::uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD CONSTRAINT "FK_articles_category"
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "articles" DROP CONSTRAINT "FK_articles_category"
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ALTER COLUMN "categoryId" TYPE varchar USING "categoryId"::varchar
    `);
  }
}
