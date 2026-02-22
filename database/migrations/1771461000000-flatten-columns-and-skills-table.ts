import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Flatten headline/residency JSONB into columns,
 * move technical_skills to a separate table.
 */
export class FlattenColumnsAndSkillsTable1771461000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Flatten headline ──────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "headline_title" varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "headline_years_of_experience" int`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "headline_seniority" varchar(40)`,
    );

    // Migrate data from JSONB to flat columns
    await queryRunner.query(`
      UPDATE "talents" SET
        "headline_title" = headline->>'title',
        "headline_years_of_experience" = (headline->>'yearsOfExperience')::int,
        "headline_seniority" = headline->>'seniority'
      WHERE headline IS NOT NULL AND headline != '{}'::jsonb
    `);

    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "headline"`,
    );

    // ── 2. Flatten residency ─────────────────────────────
    await queryRunner.query(`ALTER TABLE "talents" ADD "country" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "talents" ADD "city" varchar(80)`);

    // Migrate data from JSONB to flat columns
    await queryRunner.query(`
      UPDATE "talents" SET
        "country" = residency->>'country',
        "city" = residency->>'city'
      WHERE residency IS NOT NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "residency"`,
    );

    // ── 3. Create technical_skills table ──────────────────
    await queryRunner.query(`
      CREATE TABLE "technical_skills" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" varchar(120) NOT NULL,
        "level" varchar(20) NOT NULL,
        "variants" text[] NOT NULL DEFAULT '{}',
        "talent_id" uuid NOT NULL,
        CONSTRAINT "PK_technical_skills" PRIMARY KEY ("id"),
        CONSTRAINT "FK_technical_skills_talent"
          FOREIGN KEY ("talent_id") REFERENCES "talents"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_technical_skills_talent_id" ON "technical_skills" ("talent_id")
    `);

    // Migrate JSONB array → rows
    await queryRunner.query(`
      INSERT INTO "technical_skills" ("title", "level", "variants", "talent_id")
      SELECT
        skill->>'title',
        skill->>'level',
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(skill->'variants')),
          '{}'
        ),
        t.id
      FROM "talents" t,
        jsonb_array_elements(t.technical_skills) AS skill
      WHERE t.technical_skills IS NOT NULL
        AND jsonb_array_length(t.technical_skills) > 0
    `);

    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "technical_skills"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore technical_skills JSONB column
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "technical_skills" jsonb NOT NULL DEFAULT '[]'`,
    );

    await queryRunner.query(`
      UPDATE "talents" t SET technical_skills = COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'title', ts.title,
            'level', ts.level,
            'variants', to_jsonb(ts.variants)
          )
        ) FROM "technical_skills" ts WHERE ts.talent_id = t.id),
        '[]'
      )
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "technical_skills"`);

    // Restore residency JSONB
    await queryRunner.query(`ALTER TABLE "talents" ADD "residency" jsonb`);
    await queryRunner.query(`
      UPDATE "talents" SET residency = jsonb_build_object('country', country, 'city', city)
      WHERE country IS NOT NULL OR city IS NOT NULL
    `);
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "country"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "city"`,
    );

    // Restore headline JSONB
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "headline" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(`
      UPDATE "talents" SET headline = jsonb_build_object(
        'title', headline_title,
        'yearsOfExperience', headline_years_of_experience,
        'seniority', headline_seniority
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "headline_title"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "headline_years_of_experience"`,
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "headline_seniority"`,
    );
  }
}
