import { Injectable } from '@nestjs/common';
import { WeightsDto } from '../../radar/dto/radar-request.dto';
import { NormalizedWeights } from '../interfaces/scoring.interfaces';
import { DEFAULT_CATEGORY_WEIGHTS } from '../defaults/scoring-defaults';

@Injectable()
export class WeightNormalizer {
  normalizeCategoryWeights(weights?: WeightsDto): NormalizedWeights {
    const raw = {
      preferred: weights?.preferred ?? DEFAULT_CATEGORY_WEIGHTS.preferred,
      bonus: weights?.bonus ?? DEFAULT_CATEGORY_WEIGHTS.bonus,
    };

    const total = raw.preferred + raw.bonus;

    if (total === 0) {
      return { preferred: 0, bonus: 0 };
    }

    return {
      preferred: raw.preferred / total,
      bonus: raw.bonus / total,
    };
  }

  normalizeFilterWeights(
    activeWeights: Record<string, number>,
  ): Record<string, number> {
    const total = Object.values(activeWeights).reduce((sum, w) => sum + w, 0);

    if (total === 0) {
      return Object.fromEntries(Object.keys(activeWeights).map((k) => [k, 0]));
    }

    return Object.fromEntries(
      Object.entries(activeWeights).map(([key, weight]) => [
        key,
        weight / total,
      ]),
    );
  }
}
