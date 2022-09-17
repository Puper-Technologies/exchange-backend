import { HttpException, HttpStatus } from "@nestjs/common";

export class MongoException extends HttpException {
    constructor(private readonly errorMessage: string, private readonly error: any) {
      super(error, HttpStatus.FORBIDDEN);

    }
  }