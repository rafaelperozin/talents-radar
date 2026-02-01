import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTalents1769951750527 implements MigrationInterface {
    name = 'CreateTalents1769951750527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "talents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "full_name" character varying(120) NOT NULL,
                "email" character varying(160) NOT NULL,
                "role" character varying(80) NOT NULL,
                "seniority" character varying(40) NOT NULL,
                "headline" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8cecf07c0d624cc503d6a36df52" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_df642d41066a51df94b83d797c" ON "talents" ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_df642d41066a51df94b83d797c"
        `);
        await queryRunner.query(`
            DROP TABLE "talents"
        `);
    }

}
