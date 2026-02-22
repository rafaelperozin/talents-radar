import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRadarVersion1771463000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "radars"
      ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "radars" DROP COLUMN IF EXISTS "version"
    `);
  }
}
