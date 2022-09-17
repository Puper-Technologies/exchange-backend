import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { MyLogger } from '@shared/logger/logger.service';
import { MongoException } from './mongo-exception.filter';
import { MongoError } from 'mongodb';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: MyLogger) {
    this.logger.setContext(HttpExceptionFilter.name);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();
    const message = exception.message;
    console.log(request.headers)
    // Change the method format or create a custom logger and use here
    this.logger.error(`Error handled in Http exception filter ${JSON.stringify(exception.getResponse())}`);
    // this.logger.error(`${request.method} ${request.url} : ${message}`);

    response.status(status).send({
      error: true,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      details: exception.getResponse().valueOf(),
    });
  }
}

// Mongo exception handler
@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: MyLogger) {
    this.logger.setContext(MongoExceptionFilter.name);
  }

  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    this.logger.error(`Error handled in Mongo exception filter ${JSON.stringify(exception)}`);

    let error = {
      statusCode: HttpStatus.NOT_FOUND,
      message: "Unable to found exception"
    }

    // Need to enhance more
    switch (exception.code) {
      case 'DocumentNotFoundError': {
        error = {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Not Found the content"
        }
        break;
      }
      case 'MongooseError': {
        error = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Internal Error Occured while doing operations"
        }
        break;
      } // general Mongoose error
      case 'CastError': {
        error = {
          statusCode: HttpStatus.NOT_MODIFIED,
          message: "Unable to cast the data"
        }
        break;
      }
      case 'DisconnectedError': {
        error = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Unable to establish Connection for operation"
        }
        break;
      }
      case 'DivergentArrayError': {
        error = {
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: "Not Acceptable"
        }
        break;
      }
      case 'MissingSchemaError': {
        error = {
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: "Missing some data"
        }
        break;
      }
      case 'ValidatorError': {
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Validator Error occurred"
        }
        break;
      }
      case 'ValidationError': {
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Validation Error occurred"
        }
        break;
      }
      case 'ObjectExpectedError': { break; }
      case 'ObjectParameterError': { break; }
      case 'OverwriteModelError': { break; }
      case 'ParallelSaveError': {
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Multiple Operations not allowed"
        }
        break;
      }
      case 'StrictModeError': { break; }
      case 'VersionError': { break; }
      default: {
        error = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Internal Error while performing Operations"
        }
        break;
      }
    }

    response.status(error.statusCode).send({
      error: true,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      details: error.message,
    });
  }
}
