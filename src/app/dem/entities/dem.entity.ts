import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { Region } from './tile.entity'

export type DemDocument = HydratedDocument<Dem>

@Schema()
export class Dem {
  @Prop()
  directory: string

  @Prop()
  name: string

  @Prop()
  resolution: number

  @Prop()
  modelPixelScaleX: number

  @Prop()
  modelPixelScaleY: number

  @Prop({ type: Region })
  region: Region
}

export const DemSchema = SchemaFactory.createForClass(Dem)
