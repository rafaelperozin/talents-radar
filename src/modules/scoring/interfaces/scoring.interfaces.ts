import { TalentEntity } from '../../talent/talent.entity';

export interface ScoreBreakdown {
  preferred: number;
  bonus: number;
}

export interface ScoredTalent {
  talent: TalentEntity;
  score: number;
  breakdown: ScoreBreakdown;
}

export interface NormalizedWeights {
  preferred: number;
  bonus: number;
}
