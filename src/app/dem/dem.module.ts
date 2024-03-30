import { Module } from '@nestjs/common'
import { DemService } from './dem.service'
import { DemController } from './dem.controller'
import { Dem, DemSchema } from './entities/dem.entity'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import { Tile, TileSchema } from './entities/tile.entity'

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
  controllers: [DemController],
  providers: [DemService]
})
export class DemModule {}
