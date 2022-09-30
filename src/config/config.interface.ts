export interface DatabaseConfig {
  host: string;
  port: number;
  dbName: string;
  userName: string;
  password: string;
}

export interface FirebaseConfig {
  private_key: string;
  client_email: string;
  project_id: string;
  databaseURL: string;
}

export interface S3Config {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  bucket_name: string;
  dev_bucket_name: string;
}

/**
 * Configuration data for the app.
 */
export interface ConfigData {
  /** The port number of the http server to listen on. */
  port: number;

  /** Host name of http server */
  hostname: string;

  /** Database configurations */
  database: DatabaseConfig;

  /** firebase configurations */
  firebase: FirebaseConfig;

  /** aws s3 configuration */
  s3: S3Config;
}
