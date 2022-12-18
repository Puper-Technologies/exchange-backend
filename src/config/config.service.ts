import { Injectable } from '@nestjs/common';
import { ConfigData } from './config.interface';

/**
 * Provides a means to access the application configuration
 */
@Injectable()
export class ConfigService {
  private config: ConfigData;

  constructor(data: ConfigData = null) {
    this.config = data;
  }
  /**
   * Loads the config from environment variables.
   */
  public lofusingDotEnv() {
    this.config = this.parseConfigFromEnv(process.env);
  }

  private parseConfigFromEnv(env: NodeJS.ProcessEnv): ConfigData {
    return {
      port: parseInt(env.SERVER_PORT, 10) || 8000,
      hostname: env.SERVER_HOSTNAME || 'localhost',
      database: {
        host: env.MONGODB_HOSTNAME || 'mongodb',
        port: parseInt(env.MONGO_PORT, 10),
        dbName: env.DB_NAME,
        userName: env.MONGO_USER,
        password: env.MONGO_PASSWORD,
      },
      firebase: {
        private_key: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: env.FIREBASE_CLIENT_EMAIL,
        project_id: env.FIREBASE_PROJECT_ID,
        databaseURL: env.FIREBASE_DATABASE_URL,
      },
      s3: {
        access_key_id: env.S3_ACCESS_KEY_ID,
        secret_access_key: env.S3_SECRET_ACCESS_KEY,
        region: env.S3_REGION,
        bucket_name: env.S3_BUCKET_NAME,
        dev_bucket_name: env.S3_DEV_BUCKET_NAME,
      },
    };
  }

  public get(): Readonly<ConfigData> {
    return this.config;
  }
}
