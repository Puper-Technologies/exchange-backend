import {
  Module,
  DynamicModule,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
@Module({})
export class MongoModule {
  public static getNoSqlConnectionOptions(
    config: ConfigService,
  ): MongooseModuleOptions {
    const dbdata = config.get().database;
    if (!dbdata) {
      throw new InternalServerErrorException('Database config is missing..!');
    }

    const { host, port, dbName, userName, password } = dbdata;

    return {
      uri: 'mongodb://localhost:27017/' + dbName,
      // uri: `mongodb://${userName}:${password}@${host}:${port}/${dbName}?authSource=admin&readPreference=primary`
    };
  }
  public static forRoot(): DynamicModule {
    return {
      module: MongoModule,
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) =>
            MongoModule.getNoSqlConnectionOptions(configService),
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [],
      exports: [],
    };
  }
}
