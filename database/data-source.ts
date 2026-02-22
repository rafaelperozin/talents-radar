import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { TalentEntity } from '../src/modules/talent/talent.entity';
import { TechnicalSkillEntity } from '../src/modules/talent/technical-skill.entity';
import { RadarEntity } from '../src/modules/radar/entity/radar.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [TalentEntity, TechnicalSkillEntity, RadarEntity],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
