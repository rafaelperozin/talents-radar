import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTalentStructuredFields1771459300000 implements MigrationInterface {
  name = 'AddTalentStructuredFields1771459300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna keywords (substituída por skills JSONB)
    await queryRunner.query(
      `ALTER TABLE "talents" DROP COLUMN IF EXISTS "keywords"`,
    );

    // Adicionar campos JSONB estruturados
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "languages"`);
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "education"`);
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "experiences"`);
    await queryRunner.query(`ALTER TABLE "talents" DROP COLUMN "skills"`);

    // Restaurar keywords
    await queryRunner.query(
      `ALTER TABLE "talents" ADD "keywords" text[] NOT NULL DEFAULT '{}'`,
    );
  }
}
