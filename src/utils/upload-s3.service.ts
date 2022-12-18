import { ConfigService } from '@config/config.service';
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export default class UploadImageS3 {
  constructor() {} // private readonly config: ConfigService

  public static async uploadFile(imageBuffer: Buffer, key: string) {
    const s3 = new S3(); // ek object bnaya S3 class ka
    return await s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME!,
        Body: imageBuffer,
        // ContentType: 'image/png',
        ACL: 'public-read',
        Key: key,
      })
      .promise();
  }

  public static async deleteFile(key: string) {
    const s3 = new S3();
    return await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
      .promise();
  }
}
