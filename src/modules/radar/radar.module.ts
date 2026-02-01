import { Module } from '@nestjs/common';
import { RadarService } from './radar.service';
import { RadarController } from './radar.controller';
import { TalentModule } from '../talent/talent.module';

@Module({
  imports: [TalentModule],
  controllers: [RadarController],
  providers: [RadarService],
})
export class RadarModule {}
