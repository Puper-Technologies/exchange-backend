import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import * as fastify from 'fastify';
import * as fs from 'fs';
import * as stream from 'stream'
import * as  util from 'util'
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async uploadFile(req: fastify.FastifyRequest, res: fastify.FastifyReply<any>): Promise<any> {
    //Check request is multipart
    if (!req.isMultipart()) {
      
      throw new BadRequestException('Request is not multipart')
    }
    const mp = await req.multipart(this.handler, onEnd);
    // for key value pairs in request
    mp.on('field', function(key: any, value: any) {
      // console.log('form-data', key, value);
      console.log('on function ','key',key,'value',value);
    });
    // Uploading finished
    async function onEnd(err: any) {
      if (err) {
        res.send(new HttpException('Internal server error', 500))
        return 
      }
      // res.code(200).send(new AppResponseDto(200, undefined, 'Data uploaded successfully'))
      res.status(200).send({
        message:"successfull"
      })
      console.log('on end function');
      return ({
        messsage:"succesfull"
      })
    }

}


async handler(field: string, file: any, filename: string, encoding: string, mimetype: string): Promise<void> {

    // const pipeline = util.promisify(stream.pipeline);
    // const writeStream = fs.createWriteStream(`uploads/${filename}`); //File path
    try {
      // console.log('handler');
      // console.log(writeStream)
      // await pipeline(file, writeStream);
      await file.buffer();
      console.log(`filename: ${filename} field: ${field}` ); 
      // console.log(field)
      
    } catch (err) {
      console.error('Pipeline failed', err);
    }
  }

}
