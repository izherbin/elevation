import { Injectable } from '@nestjs/common'
import { Track } from './dto/tracks.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Dem, DemDocument } from '../dem/entities/dem.entity'
import { Model } from 'mongoose'
import { Tile, TileDocument } from '../dem/entities/tile.entity'
import { setTrackElevation } from './elevation'

@Injectable()
export class ElevationService {
  constructor(
    @InjectModel(Dem.name)
    private demModel: Model<DemDocument>,
    @InjectModel(Tile.name)
    private tileModel: Model<TileDocument>
  ) {}

  async setElevation(track: Track) {
    const dems = await this.demModel.find().sort({ resolution: -1 })
    const tiles = await this.tileModel.find()

    await setTrackElevation(track, dems, tiles)

    return track
  }
}
