import { Body, Controller, Post } from '@nestjs/common'
import { ElevationService } from './elevation.service'
import { Track } from './dto/tracks.dto'

@Controller('elevation')
export class ElevationController {
  constructor(private readonly elevationService: ElevationService) {}

  @Post()
  setElevation(@Body() track: Track) {
    return this.elevationService.setElevation(track)
  }
}
