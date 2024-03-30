import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete
} from '@nestjs/common'
import { DemService, Info } from './dem.service'
import { RegisterDemDto } from './dto/register-dem.dto'
// import { UpdateDemDto } from './dto/update-dem.dto'

@Controller('dem')
export class DemController {
  constructor(private readonly demService: DemService) {}

  @Post('register')
  async registerDem(@Body() registerDemDto: RegisterDemDto) {
    return await this.demService.registerDem(registerDemDto)
  }

  @Post('info')
  async getInfo(@Body() registerDemDto: RegisterDemDto) {
    return (await this.demService.getInfo(registerDemDto)) as Info
  }

  @Get()
  findAll() {
    return this.demService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demService.findOne(+id)
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDemDto: UpdateDemDto) {
  //   return this.demService.update(+id, updateDemDto)
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demService.remove(+id)
  }
}
