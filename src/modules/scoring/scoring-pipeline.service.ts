import { Injectable } from '@nestjs/common';
import { EssentialFilterStrategy } from './strategies/essential-filter.strategy';
import { PreferredScoringStrategy } from './strategies/preferred-scoring.strategy';
import { BonusScoringStrategy } from './strategies/bonus-scoring.strategy';
import { WeightNormalizer } from './strategies/weight-normalizer.strategy';
import { FiltersDto, WeightsDto } from '../radar/dto/radar-request.dto';
import {
  ScoredTalent,
  NormalizedWeights,
} from './interfaces/scoring.interfaces';
import { TalentEntity } from '../talent/talent.entity';

/**
 * Pipeline de scoring do Radar.
 *
 * Etapas:
 *  1. Filtros essenciais (eliminatórios — SQL + in-memory)
 *  2. Normalização de pesos (apenas preferred + bonus)
 *  3. Cálculo de score por talento (preferred + bonus)
 *  4. Ordenação por score desc
 *
 * Essential NÃO participa do score — é pura eliminação.
 * Cada etapa é isolada em seu próprio método/strategy (SRP).
 */
@Injectable()
export class ScoringPipelineService {
  constructor(
    private readonly essentialFilter: EssentialFilterStrategy,
    private readonly preferredScoring: PreferredScoringStrategy,
    private readonly bonusScoring: BonusScoringStrategy,
    private readonly weightNormalizer: WeightNormalizer,
  ) {}

  async execute(
    filters?: FiltersDto,
    weights?: WeightsDto,
  ): Promise<ScoredTalent[]> {
    const talents = await this.applyEssentialFilters(filters?.essential);
    const normalizedWeights = this.normalizeWeights(weights);
    const scored = this.scoreTalents(talents, filters, normalizedWeights);
    return this.sortByScoreDesc(scored);
  }

  private async applyEssentialFilters(
    essential?: FiltersDto['essential'],
  ): Promise<TalentEntity[]> {
    return this.essentialFilter.apply(essential);
  }

  private normalizeWeights(weights?: WeightsDto): NormalizedWeights {
    return this.weightNormalizer.normalizeCategoryWeights(weights);
  }

  private scoreTalents(
    talents: TalentEntity[],
    filters?: FiltersDto,
    weights?: NormalizedWeights,
  ): ScoredTalent[] {
    return talents.map((talent) =>
      this.scoreSingleTalent(talent, filters, weights),
    );
  }

  private scoreSingleTalent(
    talent: TalentEntity,
    filters?: FiltersDto,
    weights: NormalizedWeights = { preferred: 0, bonus: 0 },
  ): ScoredTalent {
    const preferredScore = this.preferredScoring.calculate(
      talent,
      filters?.preferred,
    );
    const bonusScore = this.bonusScoring.calculate(talent, filters?.bonus);

    const finalScore = this.computeFinalScore(
      preferredScore,
      bonusScore,
      weights,
    );

    return {
      talent,
      score: finalScore,
      breakdown: {
        preferred: parseFloat(
          (preferredScore * weights.preferred * 100).toFixed(2),
        ),
        bonus: parseFloat((bonusScore * weights.bonus * 100).toFixed(2)),
      },
    };
  }

  private computeFinalScore(
    preferredScore: number,
    bonusScore: number,
    weights: NormalizedWeights,
  ): number {
    const raw = preferredScore * weights.preferred + bonusScore * weights.bonus;

    return parseFloat((raw * 100).toFixed(2));
  }

  private sortByScoreDesc(scored: ScoredTalent[]): ScoredTalent[] {
    return scored.sort((a, b) => b.score - a.score);
  }
}
