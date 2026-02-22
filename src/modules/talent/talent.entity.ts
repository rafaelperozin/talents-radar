import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import type { WorkType } from './talent.interfaces';
import { TechnicalSkillEntity } from './technical-skill.entity';

@Entity({ name: 'talents' })
export class TalentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 80 })
  role: string;

  // ── Headline (3 colunas flat) ───────────────────────────────

  @Column({
    name: 'headline_title',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  headlineTitle?: string;

  @Column({ name: 'headline_years_of_experience', type: 'int', nullable: true })
  headlineYearsOfExperience?: number;

  @Column({
    name: 'headline_seniority',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  headlineSeniority?: string;

  // ── Residency (2 colunas flat) ──────────────────────────────

  @Column({ type: 'varchar', length: 60, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  city?: string;

  // ── Outros ──────────────────────────────────────────────────

  @Column({
    name: 'expected_salary',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  expectedSalary?: number;

  @Column({
    name: 'preferred_work_type',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  preferredWorkType?: WorkType;

  /** Relação 1:N com technical_skills */
  @OneToMany(() => TechnicalSkillEntity, (ts) => ts.talent, {
    eager: true,
    cascade: true,
  })
  technicalSkills: TechnicalSkillEntity[];

  /** Soft skills (buzz words) */
  @Column({
    name: 'soft_skills',
    type: 'jsonb',
    nullable: false,
    default: () => "'[]'",
  })
  softSkills: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
