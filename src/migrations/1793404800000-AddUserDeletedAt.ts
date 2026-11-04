import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserDeletedAt1793404800000 implements MigrationInterface {
  name = "AddUserDeletedAt1793404800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "deletedAt"`);
  }
}