import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Refactoring: simplifica talents para campos básicos + skills.
 * Remove colunas antigas, adiciona novos campos JSONB / varchar.
 */
export class SimplifyTalentFields1771460000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Remover colunas antigas ──────────────────────────
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "seniority"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "headline"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "country"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "city"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "remote"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "years_experience"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "skills"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "experiences"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "education"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "languages"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "tags"`,
    );

    // ── Adicionar novas colunas ──────────────────────────
    await queryRunner.query(`ALTER TABLE "talents" ADD "phone" varchar(30)`);
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "headline" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(`ALTER TABLE "talents" ADD "residency" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "expected_salary" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "preferred_work_type" varchar(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "technical_skills" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "soft_skills" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover novas colunas
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "soft_skills"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "technical_skills"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "preferred_work_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "expected_salary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "residency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "headline"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "phone"`,
    );

    // Restaurar antigas
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "seniority" varchar(40)`,
    );
    await queryRunner.query(`ALTER TABLE "talents" ADD "headline" text`);
    await queryRunner.query(`ALTER TABLE "talents" ADD "country" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "talents" ADD "city" varchar(80)`);
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "remote" boolean DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "talents" ADD "years_experience" int`);
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "skills" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "experiences" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "education" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "languages" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "tags" text[] NOT NULL DEFAULT '{}'`,
    );
  }
}
