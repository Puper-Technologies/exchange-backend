import { NestFactory } from '@nestjs/core';
import { AppModule } from './routes/app/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import ValidationExceptions from './common/exceptions/validation.exceptions';
import { MyLogger } from './shared/logger/logger.service';
// import { HttpExceptionFilter } from '@filters/http-Exception.filter';
// import { AllExceptionsFilter } from '@filters/all-exception.filter';
// import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from './config/config.service';
import * as firebaseAdmin from 'firebase-admin';
// import {initializeApp} from 'firebase/app';
// import { LoggingIntercepter } from '@interceptors/logger.intercepter';
// import '@config/firebase.config'
// import serviceAccount from './config/firebaseServiceAccountKey.json';
import multipart from 'fastify-multipart';
import { config } from 'aws-sdk';
import { app } from 'firebase-admin';
async function bootstrap() {
  // Intitalizing the app with fastify service
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true, cors: true },
  );
  app.useLogger(new MyLogger());

  app.setGlobalPrefix('api');
  app.register(multipart);
  // Configuration
  const configService = app.get(ConfigService);

  // Intitalizing the app with firebase admin service
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      private_key: configService.get().firebase.private_key,
      client_email: configService.get().firebase.client_email,
      project_id: configService.get().firebase.project_id,
    } as Partial<firebaseAdmin.ServiceAccount>),
    databaseURL: configService.get().firebase.databaseURL,
  });

  config.update({
    accessKeyId: configService.get().s3.access_key_id,
    secretAccessKey: configService.get().s3.secret_access_key,
    region: configService.get().s3.region,
  });

  //Try to pass a global exception handler which can catch unrecognised errors and exceptions
  // app.useGlobalFilters(new AllExceptionsFilter(new HttpAdapterHost()));

  // Global validation Exception handler
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationExceptions(errors),
      transform: true,
    }),
  );

  // Setting latest fastify swagger configuration for api documentation purpose
  const swaggerConfig = new DocumentBuilder()
    .setTitle('exchange server')
    .setDescription(
      'This is the exchange api doc designed to configure clients.',
    )
    .setVersion('1.0.0')
    .addTag('cryptocase_v1.0.0')
    .addBearerAuth()
    .build();

  const swagger = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, swagger);

  const port = configService.get().port;
  const host_name = configService.get().hostname;
  await app.listen(port, host_name, async (err) => {
    if (err) return console.log('Error occured in establishing server ');

    console.log(
      `The server is running on ${port} port: http://${host_name}:${port}/api/v1/docs`,
    );
  });
}

// Initialising the server
export default firebaseAdmin;
bootstrap();
