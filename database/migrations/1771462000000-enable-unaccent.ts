import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Habilita a extensão unaccent do PostgreSQL para buscas
 * insensíveis a acentos nas queries SQL.
 */
export class EnableUnaccent1771462000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS unaccent`);
  }
}
