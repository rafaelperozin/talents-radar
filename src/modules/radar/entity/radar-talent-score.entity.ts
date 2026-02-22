import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export type ScoreStatus = 'OK' | 'ERROR';

@Entity({ name: 'radar_talent_scores' })
@Unique(['radarId', 'talentId'])
export class RadarTalentScoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'radar_id', type: 'uuid' })
  radarId: string;

  @Column({ name: 'talent_id', type: 'uuid' })
  talentId: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  score: number;

  @Column({ name: 'score_breakdown', type: 'jsonb', nullable: true })
  scoreBreakdown?: Record<string, number>;

  @Column({ name: 'computed_at', type: 'timestamptz' })
  computedAt: Date;

  @Column({ name: 'talent_updated_at_snapshot', type: 'timestamptz' })
  talentUpdatedAtSnapshot: Date;

  @Column({ name: 'radar_version_snapshot', type: 'int' })
  radarVersionSnapshot: number;

  @Column({ type: 'varchar', length: 10, default: 'OK' })
  status: ScoreStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;
}
