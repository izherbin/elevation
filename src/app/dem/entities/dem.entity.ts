import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooSchema } from 'mongoose'
import { Region } from './tile.entity'

export type DemDocument = HydratedDocument<Dem>

@Schema()
export class Dem {
  @Prop()
  directory: string

  @Prop()
  resolution: number

  @Prop()
  modelPixelScaleX: number

  @Prop()
  modelPixelScaleY: number

  @Prop({ type: Region })
  region: Region

  @Prop({ type: [{ type: MongooSchema.Types.ObjectId, ref: 'Tile' }] })
  tiles: MongooSchema.Types.ObjectId[]
}

export const DemSchema = SchemaFactory.createForClass(Dem)
