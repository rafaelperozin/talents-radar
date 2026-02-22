import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadarService } from './radar.service';
import { RadarController } from './radar.controller';
import { RadarEntity } from './entity/radar.entity';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [TypeOrmModule.forFeature([RadarEntity]), ScoringModule],
  controllers: [RadarController],
  providers: [RadarService],
})
export class RadarModule {}
