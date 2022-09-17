import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from '@resources/database/mongo.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import V1Module from '@v1/v1.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingIntercepter } from '@interceptors/logger.intercepter';
import { LoggerModule } from '@shared/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [`${process.env.NODE_ENV}.env`],
      load: []
    }),
    MongoModule.forRoot(),
    V1Module,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingIntercepter
    }
  ],
})
export class AppModule {}

