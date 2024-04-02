import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DemModule } from './app/dem/dem.module'
import { ElevationModule } from './app/elevation/elevation.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const options: MongooseModuleOptions = {
          uri: configService.get<string>('DATABASE_URL')
        }

        return options
      }
    }),
    ConfigModule.forRoot({
      cache: true
    }),
    DemModule,
    ElevationModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
