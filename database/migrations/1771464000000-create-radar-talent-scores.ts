import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRadarTalentScores1771464000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "radar_talent_scores" (
        "id"                          uuid          NOT NULL DEFAULT gen_random_uuid(),
        "radar_id"                    uuid          NOT NULL,
        "talent_id"                   uuid          NOT NULL,
        "score"                       numeric(8,2)  NOT NULL,
        "score_breakdown"             jsonb,
        "computed_at"                 timestamptz   NOT NULL DEFAULT now(),
        "talent_updated_at_snapshot"  timestamptz   NOT NULL,
        "radar_version_snapshot"      integer       NOT NULL,
        "status"                      varchar(10)   NOT NULL DEFAULT 'OK',
        "error_message"               text,
        CONSTRAINT "PK_radar_talent_scores" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_radar_talent" UNIQUE ("radar_id", "talent_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_rts_radar_id"  ON "radar_talent_scores" ("radar_id");
      CREATE INDEX IF NOT EXISTS "IDX_rts_talent_id" ON "radar_talent_scores" ("talent_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "radar_talent_scores"`);
  }
}
