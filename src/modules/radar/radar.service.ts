import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadarEntity } from './entity/radar.entity';
import { RadarRequestDto } from './dto/radar-request.dto';
import { ScoringPipelineService } from '../scoring/scoring-pipeline.service';
import { ScoredTalent } from '../scoring/interfaces/scoring.interfaces';

@Injectable()
export class RadarService {
  constructor(
    @InjectRepository(RadarEntity)
    private readonly radarsRepo: Repository<RadarEntity>,
    private readonly scoringPipeline: ScoringPipelineService,
  ) {}

  async searchTalents(
    dto: RadarRequestDto,
  ): Promise<{ radarId: string; talents: ScoredTalent[] }> {
    const radar = await this.persistRadarConfig(dto);

    const scoredTalents = await this.scoringPipeline.execute(
      dto.filters,
      dto.weights,
    );

    return {
      radarId: radar.id,
      talents: scoredTalents,
    };
  }

  private async persistRadarConfig(dto: RadarRequestDto): Promise<RadarEntity> {
    const radar = this.radarsRepo.create({
      filters: dto.filters as Record<string, any>,
      weights: dto.weights as Record<string, any>,
    });
    return this.radarsRepo.save(radar);
  }
}
