import { Module } from '@nestjs/common';
import { TalentModule } from '../talent/talent.module';
import { ScoringPipelineService } from './scoring-pipeline.service';
import { EssentialFilterStrategy } from './strategies/essential-filter.strategy';
import { PreferredScoringStrategy } from './strategies/preferred-scoring.strategy';
import { BonusScoringStrategy } from './strategies/bonus-scoring.strategy';
import { WeightNormalizer } from './strategies/weight-normalizer.strategy';

@Module({
  imports: [TalentModule],
  providers: [
    ScoringPipelineService,
    EssentialFilterStrategy,
    PreferredScoringStrategy,
    BonusScoringStrategy,
    WeightNormalizer,
  ],
  exports: [ScoringPipelineService],
})
export class ScoringModule {}
