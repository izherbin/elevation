import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { RegisterDemDto } from './dto/register-dem.dto'
// import { UpdateDemDto } from './dto/update-dem.dto'
import { Dem, DemDocument } from './entities/dem.entity'
import { Model /*, Schema as MongooSchema*/ } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { gdalInfo } from './gdalinfo.js'
import { Tile, TileDocument } from './entities/tile.entity'
import fs from 'fs'
import path from 'path'

export interface Info {
  dem: {
    directory: string
    resolution: string
    modelPixelScaleX: number
    modelPixelScaleY: number
  }

  tile: {
    file: string
    width: number
    height: number
    region: {
      maxLon: number
      maxLat: number
      minLon: number
      minLat: number
    }
  }
}

@Injectable()
export class DemService {
  constructor(
    @InjectModel(Dem.name)
    private demModel: Model<DemDocument>,
    @InjectModel(Tile.name)
    private tileModel: Model<TileDocument>
  ) {}

  async registerDem(registerDemDto: RegisterDemDto) {
    const { file, directory, resolution } = registerDemDto
    if (!directory) {
      throw new HttpException('No directory specified', HttpStatus.BAD_REQUEST)
    }
    if (!resolution) {
      throw new HttpException('No resolution specified', HttpStatus.BAD_REQUEST)
    }

    const dem: DemDocument = await this.getDem(registerDemDto)

    if (!file) {
      const files = fs.readdirSync(directory)
      let count = 0
      for (const file of files) {
        if (
          fs.statSync(directory + file).isDirectory() ||
          path.extname(directory + file) !== '.tif'
        )
          continue

        registerDemDto.file = file
        await this.registerTile(registerDemDto, dem)
        count++
        console.log('Зарегистрировано тайлов:', count, '\r')
      }
    } else {
      await this.registerTile(registerDemDto, dem)
    }

    await dem.save()

    return 'DEM registered successfully'
  }

  async registerTile(registerDemDto: RegisterDemDto, dem: DemDocument) {
    const info: Info = await gdalInfo(registerDemDto)

    const tile = new this.tileModel({
      dem: dem._id,
      ...info.tile
    })
    await tile.save()

    const { minLat, minLon, maxLat, maxLon } = dem.region
    dem.region.minLat =
      info.tile.region.minLat < minLat ? info.tile.region.minLat : minLat
    dem.region.minLon =
      info.tile.region.minLon < minLon ? info.tile.region.minLon : minLon
    dem.region.maxLat =
      info.tile.region.maxLat > maxLat ? info.tile.region.maxLat : maxLat
    dem.region.maxLon =
      info.tile.region.maxLon > maxLon ? info.tile.region.maxLon : maxLon
  }

  async getDem(registerDemDto: RegisterDemDto): Promise<DemDocument> {
    const { directory, name, resolution, demId } = registerDemDto

    let dem: DemDocument

    if (!demId) {
      dem = new this.demModel({
        resolution,
        name,
        directory,
        region: {
          minLat: 90,
          minLon: 180,
          maxLat: -90,
          maxLon: -180
        }
      })
    } else {
      dem = await this.demModel.findById(demId)
    }

    return dem
  }

  async getInfo(registerDemDto: RegisterDemDto) {
    const info: Info = await gdalInfo(registerDemDto)
    return info
  }

  findAll() {
    return `This action returns all dem`
  }

  findOne(id: number) {
    return `This action returns a #${id} dem`
  }

  // update(id: number, updateDemDto: UpdateDemDto) {
  //   return `This action updates a #${id} dem`
  // }

  remove(id: number) {
    return `This action removes a #${id} dem`
  }
}
