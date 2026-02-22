import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadarEntity } from './entity/radar.entity';
import { RadarTalentScoreEntity } from './entity/radar-talent-score.entity';
import { RadarRequestDto } from './dto/radar-request.dto';
import { RadarSyncResponse } from './dto/radar-sync-result.dto';
import { ScoringPipelineService } from '../scoring/scoring-pipeline.service';
import {
  ScoredTalent,
  ScoreBreakdown,
} from '../scoring/interfaces/scoring.interfaces';
import { TalentEntity } from '../talent/talent.entity';

const SYNC_BATCH_SIZE = 200;

export type RadarPostResult =
  | { radarId: string; talents: ScoredTalent[] }
  | RadarSyncResponse;

@Injectable()
export class RadarService {
  constructor(
    @InjectRepository(RadarEntity)
    private readonly radarsRepo: Repository<RadarEntity>,
    @InjectRepository(RadarTalentScoreEntity)
    private readonly scoresRepo: Repository<RadarTalentScoreEntity>,
    private readonly scoringPipeline: ScoringPipelineService,
  ) {}

  async searchTalents(dto: RadarRequestDto): Promise<RadarPostResult> {
    if (dto.radarId) {
      return this.syncRadarScores(dto.radarId);
    }

    const radar = await this.createRadarConfig(dto);
    const talents = await this.scoringPipeline.execute(
      dto.filters,
      dto.weights,
    );
    return { radarId: radar.id, talents };
  }

  async syncRadarScores(radarId: string): Promise<RadarSyncResponse> {
    const radar = await this.radarsRepo.findOne({ where: { id: radarId } });
    if (!radar) throw new NotFoundException(`Radar ${radarId} not found`);

    const radarFilters = radar.filters as RadarRequestDto['filters'];
    const radarWeights = radar.weights as RadarRequestDto['weights'];

    // 1. Current candidate pool with essential filters applied
    const candidates = await this.scoringPipeline.filterEssential(
      radarFilters?.essential,
    );

    // 2. All existing score rows for this radar
    const existingScores = await this.loadExistingScores(radarId);

    // 3. Partition candidates into stale vs fresh.
    const toCompute: TalentEntity[] = [];
    const isCreate = new Set<string>();
    let skipped = 0;

    const radarConfigChanged = [...existingScores.values()].some(
      (r) => r.radarVersionSnapshot !== radar.version,
    );

    if (radarConfigChanged) {
      // Recompute every candidate.
      for (const talent of candidates) {
        toCompute.push(talent);
        if (!existingScores.has(talent.id)) isCreate.add(talent.id);
      }
    } else {
      // Only new or profile-updated talents need recomputing.
      for (const talent of candidates) {
        const existing = existingScores.get(talent.id);
        if (!existing) {
          toCompute.push(talent);
          isCreate.add(talent.id);
        } else if (talent.updatedAt > existing.talentUpdatedAtSnapshot) {
          toCompute.push(talent);
        } else {
          skipped++;
        }
      }
    }

    // 4. Nothing changed, serve everything from cache
    if (toCompute.length === 0) {
      return {
        radarId,
        radarVersion: radar.version,
        sync: {
          created: 0,
          updated: 0,
          skipped,
          errors: 0,
          fromCache: true,
          radarConfigChanged: false,
        },
        talents: this.buildTalentsFromCache(candidates, existingScores),
      };
    }

    // 5. Recalculate stale in batches, upsert, merge with cache
    let created = 0;
    let updated = 0;
    let errors = 0;
    const freshScores = new Map<string, RadarTalentScoreEntity>();

    for (let i = 0; i < toCompute.length; i += SYNC_BATCH_SIZE) {
      const batch = toCompute.slice(i, i + SYNC_BATCH_SIZE);
      const rows = this.buildScoreRows(
        batch,
        radarFilters,
        radarWeights,
        radar,
        isCreate,
      );

      for (const r of rows) {
        if (r.status === 'ERROR') errors++;
        else if (isCreate.has(r.talentId)) created++;
        else updated++;
        freshScores.set(r.talentId, r);
      }

      await this.scoresRepo.upsert(rows, ['radarId', 'talentId']);
    }

    // 6. Merge fresh wins over cached
    const mergedScores = new Map([...existingScores, ...freshScores]);

    return {
      radarId,
      radarVersion: radar.version,
      sync: {
        created,
        updated,
        skipped,
        errors,
        fromCache: false,
        radarConfigChanged,
      },
      talents: this.buildTalentsFromCache(candidates, mergedScores),
    };
  }

  private async createRadarConfig(dto: RadarRequestDto): Promise<RadarEntity> {
    const radar = this.radarsRepo.create({
      filters: dto.filters as Record<string, any>,
      weights: dto.weights as Record<string, any>,
      version: 1,
    });
    return this.radarsRepo.save(radar);
  }

  private async loadExistingScores(
    radarId: string,
  ): Promise<Map<string, RadarTalentScoreEntity>> {
    const rows = await this.scoresRepo.find({ where: { radarId } });
    return new Map(rows.map((r) => [r.talentId, r]));
  }

  private buildTalentsFromCache(
    candidates: TalentEntity[],
    scores: Map<string, RadarTalentScoreEntity>,
  ): ScoredTalent[] {
    return candidates
      .filter((t) => scores.has(t.id))
      .map((t) => {
        const row = scores.get(t.id)!;
        const breakdown = (row.scoreBreakdown ?? {
          preferred: 0,
          bonus: 0,
        }) as unknown as ScoreBreakdown;
        return { talent: t, score: Number(row.score), breakdown };
      })
      .sort((a, b) => b.score - a.score);
  }

  private buildScoreRows(
    talents: TalentEntity[],
    filters: RadarRequestDto['filters'],
    weights: RadarRequestDto['weights'],
    radar: RadarEntity,
    isCreate: Set<string>,
  ): RadarTalentScoreEntity[] {
    void isCreate;
    const now = new Date();
    const scored = this.scoringPipeline.scorePrefiltered(
      talents,
      filters,
      weights,
    );

    return scored.map((s) =>
      this.scoresRepo.create({
        radarId: radar.id,
        talentId: s.talent.id,
        score: s.score,
        scoreBreakdown: s.breakdown as unknown as Record<string, number>,
        computedAt: now,
        talentUpdatedAtSnapshot: s.talent.updatedAt,
        radarVersionSnapshot: radar.version,
        status: 'OK',
      }),
    );
  }
}
