import { Module } from '@nestjs/common'
import { ElevationService } from './elevation.service'
import { ElevationController } from './elevation.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Dem, DemSchema } from '../dem/entities/dem.entity'
import { Tile, TileSchema } from '../dem/entities/tile.entity'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dem.name, schema: DemSchema },
      { name: Tile.name, schema: TileSchema }
    ]),
    ConfigModule.forRoot({
      cache: true
    })
  ],
  controllers: [ElevationController],
  providers: [ElevationService]
})
export class ElevationModule {}
