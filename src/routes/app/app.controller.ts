import {
  Controller,
  Get,
  Post,
  Logger,
  Req,
  HttpException,
  BadRequestException,
  Res,
} from '@nestjs/common';

import { AppService } from './app.service';
import fastify = require('fastify');
import * as fs from 'fs';
import stream = require('stream');

import * as util from 'util';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // this.logger.error("this is test logger")
    return this.appService.getHello();
  }

  // @Post('/image')
  // async dummyImageUpload(
  //   @Req() req: fastify.FastifyRequest,
  //   @Res() res: fastify.FastifyReply<any>,
  // ) {
  //   // console.log('rahul');
  //   // const data = await this.appService.uploadFile(req,res)
  //   // // console.log(req)
  //   const data = await req.file();
  //   const bufferdata = await data.toBuffer();
  //   // upload to s3

  //   return {
  //     message: 'reqest recieved',
  //   };
  // }
}
