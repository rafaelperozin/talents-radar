import { Injectable } from '@nestjs/common';
import { TalentEntity } from '../../talent/talent.entity';
import {
  PreferredFiltersDto,
  WeightedTechnicalSkillDto,
} from '../../radar/dto/radar-request.dto';
import {
  DEFAULT_PREFERRED_FILTER_WEIGHTS,
  DEFAULT_SKILL_WEIGHT,
  OVER_LEVEL_FACTOR,
  MAX_SKILL_SCORE,
  SALARY_BELOW_FACTOR,
  SALARY_ABOVE_TOLERANCE,
  SENIORITY_PENALTY_PER_LEVEL,
} from '../defaults/scoring-defaults';
import {
  SKILL_LEVEL_VALUES,
  SENIORITY_ORDER,
} from '../../talent/talent.interfaces';
import type { SkillLevel } from '../../talent/talent.interfaces';
import { normalizeText } from '../../shared/utils/text-normalize.util';
import { WeightNormalizer } from './weight-normalizer.strategy';

interface SubScore {
  key: string;
  score: number;
  weight: number;
}

@Injectable()
export class PreferredScoringStrategy {
  constructor(private readonly weightNormalizer: WeightNormalizer) {}

  calculate(talent: TalentEntity, preferred?: PreferredFiltersDto): number {
    if (!preferred) return 0;

    const subScores = this.collectSubScores(talent, preferred);
    if (subScores.length === 0) return 0;

    return this.computeWeightedAverage(subScores);
  }

  private collectSubScores(
    talent: TalentEntity,
    preferred: PreferredFiltersDto,
  ): SubScore[] {
    type Key = keyof typeof DEFAULT_PREFERRED_FILTER_WEIGHTS;
    const criteria: [Key, boolean, () => number][] = [
      [
        'technicalSkills',
        !!preferred.technicalSkills?.length,
        () => this.technicalSkillsScore(talent, preferred.technicalSkills!),
      ],
      [
        'softSkills',
        !!preferred.softSkills?.length,
        () => this.softSkillsScore(talent, preferred.softSkills!),
      ],
      [
        'salary',
        preferred.salary !== undefined && preferred.salary > 0,
        () => this.salaryScore(talent, preferred.salary!),
      ],
      [
        'workType',
        !!preferred.workType?.length,
        () => this.workTypeScore(talent, preferred.workType!),
      ],
      [
        'seniority',
        !!preferred.seniority,
        () => this.seniorityScore(talent, preferred.seniority!),
      ],
      [
        'keywords',
        !!preferred.keywords?.length,
        () => this.keywordSearch(talent, preferred.keywords!),
      ],
    ];

    return criteria
      .filter(([, active]) => active)
      .map(([key, , computeScore]) => ({
        key,
        score: computeScore(),
        weight: DEFAULT_PREFERRED_FILTER_WEIGHTS[key],
      }));
  }

  private technicalSkillsScore(
    talent: TalentEntity,
    requestedSkills: WeightedTechnicalSkillDto[],
  ): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const req of requestedSkills) {
      const skillWeight = req.weight ?? DEFAULT_SKILL_WEIGHT;
      totalWeight += skillWeight;

      const match = this.findSkillMatch(talent, req.name);
      if (!match) continue; // skill não encontrada → score 0 para essa

      const rawScore = this.computeLevelScore(match.level, req.expectedLevel);
      weightedSum += rawScore * skillWeight;
    }

    if (totalWeight === 0) return 0;

    return weightedSum / (totalWeight * MAX_SKILL_SCORE);
  }

  private findSkillMatch(
    talent: TalentEntity,
    reqName: string,
  ): { level: string } | undefined {
    const name = normalizeText(reqName);

    return (talent.technicalSkills ?? []).find((ts) => {
      if (normalizeText(ts.title) === name) return true;
      return (ts.variants ?? []).some((v) => normalizeText(v) === name);
    });
  }

  private computeLevelScore(
    talentLevel: string,
    expectedLevel: string,
  ): number {
    const tVal = SKILL_LEVEL_VALUES[talentLevel as SkillLevel] ?? 0;
    const eVal = SKILL_LEVEL_VALUES[expectedLevel as SkillLevel] ?? 1;

    if (tVal === 0) return 0;

    const ratio = tVal / eVal;

    const underRatio = ratio < 1;
    if (underRatio) return ratio * MAX_SKILL_SCORE;

    const extraRatio = (tVal - eVal) / eVal;
    return Math.min(
      (1.0 + OVER_LEVEL_FACTOR * extraRatio) * MAX_SKILL_SCORE,
      MAX_SKILL_SCORE,
    );
  }

  private softSkillsScore(talent: TalentEntity, requested: string[]): number {
    const talentSet = new Set(
      (talent.softSkills ?? []).map((s) => normalizeText(s)),
    );
    const matched = requested.filter((s) =>
      talentSet.has(normalizeText(s)),
    ).length;
    return matched / requested.length;
  }

  private salaryScore(talent: TalentEntity, target: number): number {
    if (!talent.expectedSalary) return 0.5;

    const salary = Number(talent.expectedSalary);

    if (salary <= target) {
      const underRatio = (target - salary) / target;
      return 1.0 - underRatio * SALARY_BELOW_FACTOR;
    }

    const overRatio = (salary - target) / (target * SALARY_ABOVE_TOLERANCE);
    return Math.max(0, 1.0 - overRatio);
  }

  private workTypeScore(talent: TalentEntity, desired: string[]): number {
    if (!talent.preferredWorkType) return 0;
    return desired.some(
      (wt) => wt.toLowerCase() === talent.preferredWorkType!.toLowerCase(),
    )
      ? 1
      : 0;
  }

  private seniorityScore(talent: TalentEntity, desired: string): number {
    const talentSeniority = talent.headlineSeniority;
    if (!talentSeniority) return 0;

    const iDesired = SENIORITY_ORDER.indexOf(
      normalizeText(desired) as (typeof SENIORITY_ORDER)[number],
    );
    const iTalent = SENIORITY_ORDER.indexOf(
      normalizeText(talentSeniority) as (typeof SENIORITY_ORDER)[number],
    );

    if (iDesired === -1 || iTalent === -1) {
      return normalizeText(talentSeniority) === normalizeText(desired) ? 1 : 0;
    }

    const distance = Math.abs(iDesired - iTalent);
    return Math.max(0, 1 - distance * SENIORITY_PENALTY_PER_LEVEL);
  }

  private keywordSearch(talent: TalentEntity, keywords: string[]): number {
    const text = this.buildSearchableText(talent);
    const matched = keywords.filter((kw) =>
      text.includes(normalizeText(kw)),
    ).length;
    return matched / keywords.length;
  }

  private buildSearchableText(talent: TalentEntity): string {
    const parts: string[] = [
      talent.fullName,
      talent.role,
      talent.headlineTitle ?? '',
      talent.headlineSeniority ?? '',
      talent.country ?? '',
      talent.city ?? '',
      talent.preferredWorkType ?? '',
      ...(talent.technicalSkills ?? []).flatMap((s) => [
        s.title,
        ...(s.variants ?? []),
      ]),
      ...(talent.softSkills ?? []),
    ];
    return normalizeText(parts.join(' '));
  }

  private computeWeightedAverage(subScores: SubScore[]): number {
    const rawWeights: Record<string, number> = {};
    for (const s of subScores) {
      rawWeights[s.key] = s.weight;
    }

    const normalized = this.weightNormalizer.normalizeFilterWeights(rawWeights);

    return subScores.reduce(
      (sum, s) => sum + s.score * (normalized[s.key] ?? 0),
      0,
    );
  }
}
