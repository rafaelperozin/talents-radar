import { Controller, Post, Body } from '@nestjs/common';
import { RadarService } from './radar.service';
import { RadarRequestDto } from './dto/radar-request.dto';

@Controller('radar')
export class RadarController {
  constructor(private readonly radarService: RadarService) {}

  @Post()
  searchTalents(@Body() dto: RadarRequestDto) {
    return this.radarService.searchTalents(dto);
  }
}
