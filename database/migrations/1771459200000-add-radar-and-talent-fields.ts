import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRadarAndTalentFields1771459200000 implements MigrationInterface {
  name = 'AddRadarAndTalentFields1771459200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Novas colunas na tabela talents ─────────────────────
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "country" character varying(60)`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "city" character varying(80)`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "remote" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "years_experience" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "keywords" text[] NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "tags" text[] NOT NULL DEFAULT '{}'`,
    );

    // ── Tabela radars ───────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "radars" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "filters" jsonb,
        "weights" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_radars_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "radars"`);
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "tags"`);
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "keywords"`);
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN "years_experience"`,
    );
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "remote"`);
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "country"`);
  }
}
