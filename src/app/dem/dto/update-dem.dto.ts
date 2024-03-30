import { PartialType } from '@nestjs/mapped-types'
import { RegisterDemDto } from './register-dem.dto'

export class UpdateDemDto extends PartialType(RegisterDemDto) {}
