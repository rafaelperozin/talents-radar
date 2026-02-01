import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TalentEntity } from '../talent/talent.entity';

@Injectable()
export class RadarService {
  constructor(
    @InjectRepository(TalentEntity)
    private readonly talentsRepo: Repository<TalentEntity>,
  ) {}

  async getRadar() {
    const talents = await this.talentsRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return { talents };
  }
}
