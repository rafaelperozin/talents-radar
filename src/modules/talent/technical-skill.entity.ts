import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { SkillLevel } from './talent.interfaces';
import { TalentEntity } from './talent.entity';

@Entity({ name: 'technical_skills' })
export class TechnicalSkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'varchar', length: 20 })
  level: SkillLevel;

  @Column({ type: 'text', array: true, nullable: false, default: () => "'{}'" })
  variants: string[];

  @ManyToOne(() => TalentEntity, (t) => t.technicalSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'talent_id' })
  talent: TalentEntity;

  @Exclude()
  @Column({ name: 'talent_id', type: 'uuid' })
  talentId: string;
}
