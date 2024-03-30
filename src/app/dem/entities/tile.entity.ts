import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooSchema } from 'mongoose'

export type TileDocument = HydratedDocument<Tile>

@Schema({ _id: false })
export class Region {
  @Prop()
  maxLon: number

  @Prop()
  maxLat: number

  @Prop()
  minLon: number

  @Prop()
  minLat: number
}

@Schema()
export class Tile {
  @Prop()
  file: string

  @Prop({ type: MongooSchema.Types.ObjectId, ref: 'Dem' })
  dem: MongooSchema.Types.ObjectId

  @Prop()
  width: number

  @Prop()
  height: number

  @Prop({ type: Region })
  region: Region
}

export const TileSchema = SchemaFactory.createForClass(Tile)
