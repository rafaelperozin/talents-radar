import { Controller, Get } from '@nestjs/common';
import { RadarService } from './radar.service';

@Controller('radar')
export class RadarController {
  constructor(private readonly radarService: RadarService) {}

  @Get()
  getRadar() {
    return this.radarService.getRadar();
  }
}
