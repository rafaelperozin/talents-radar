import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TalentEntity } from '../../talent/talent.entity';
import { EssentialFiltersDto } from '../../radar/dto/radar-request.dto';
import { SKILL_LEVEL_VALUES } from '../../talent/talent.interfaces';
import type { SkillLevel } from '../../talent/talent.interfaces';
import { normalizeText } from '../../shared/utils/text-normalize.util';

@Injectable()
export class EssentialFilterStrategy {
  constructor(
    @InjectRepository(TalentEntity)
    private readonly talentsRepo: Repository<TalentEntity>,
  ) {}

  async apply(essential?: EssentialFiltersDto): Promise<TalentEntity[]> {
    const qb = this.talentsRepo
      .createQueryBuilder('talent')
      .leftJoinAndSelect('talent.technicalSkills', 'ts');

    if (essential) {
      this.applyLocationFilter(qb, essential);
      this.applyWorkTypeFilter(qb, essential);
      this.applySoftSkillsFilter(qb, essential);
    }

    const talents = await qb.getMany();

    if (!essential) return talents;

    return talents.filter((t) => this.matchesTechnicalSkills(t, essential));
  }

  // ── SQL filters ─────────────────────────────────────────────

  private applyLocationFilter(
    qb: SelectQueryBuilder<TalentEntity>,
    essential: EssentialFiltersDto,
  ): void {
    if (essential.country) {
      qb.andWhere(
        'unaccent(LOWER(talent.country)) = unaccent(LOWER(:country))',
        {
          country: essential.country,
        },
      );
    }
    if (essential.city) {
      qb.andWhere('unaccent(LOWER(talent.city)) = unaccent(LOWER(:city))', {
        city: essential.city,
      });
    }
  }

  private applyWorkTypeFilter(
    qb: SelectQueryBuilder<TalentEntity>,
    essential: EssentialFiltersDto,
  ): void {
    if (!essential.workType?.length) return;
    qb.andWhere('talent.preferred_work_type IN (:...workTypes)', {
      workTypes: essential.workType,
    });
  }

  private applySoftSkillsFilter(
    qb: SelectQueryBuilder<TalentEntity>,
    essential: EssentialFiltersDto,
  ): void {
    if (!essential.softSkills?.length) return;

    essential.softSkills.forEach((ss, i) => {
      const param = `essSoft_${i}`;
      qb.andWhere(
        `EXISTS (SELECT 1 FROM jsonb_array_elements_text(talent.soft_skills) elem WHERE unaccent(LOWER(elem)) = unaccent(LOWER(:${param})))`,
        { [param]: ss },
      );
    });
  }

  // ── In-memory filters ───────────────────────────────────────
  private matchesTechnicalSkills(
    talent: TalentEntity,
    essential: EssentialFiltersDto,
  ): boolean {
    if (!essential.technicalSkills?.length) return true;

    return essential.technicalSkills.every((req) => {
      const reqName = normalizeText(req.name);
      const match = (talent.technicalSkills ?? []).find((ts) => {
        if (normalizeText(ts.title) === reqName) return true;
        return (ts.variants ?? []).some((v) => normalizeText(v) === reqName);
      });

      if (!match) return false;

      const talentLevel = SKILL_LEVEL_VALUES[match.level] ?? 0;
      const requiredLevel = SKILL_LEVEL_VALUES[req.minLevel as SkillLevel] ?? 0;

      return talentLevel >= requiredLevel;
    });
  }
}
