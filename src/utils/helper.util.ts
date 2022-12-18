import { OtpUserDto } from 'src/routes/v1/users/dto/otp-user.dto';
import { HmacSHA256, enc } from 'crypto-js';
import { indexOf } from 'lodash';

class Helper {
  public generateOtp(length: number) {
    const randomOtp = Math.floor(100000 + Math.random() * 900000);
    const otp: OtpUserDto = {
      otpValue: randomOtp,
      expiryTime: new Date(Date.now() + 10 * 60000).getTime(),
    };
    return otp;
  }

  generateSignature(queryParams: Object, data: string) {
    let queryPath = '';
    if (queryParams) {
      for (const i in queryParams) {
        if (Object.values(queryParams)[0] === queryParams[i]) {
          queryPath += `${i}=${queryParams[i]}`;
        } else {
          queryPath += `&${i}=${queryParams[i]}`;
        }
      }
    }
    console.log(queryPath);
    const signature = HmacSHA256(queryPath, data).toString(enc.Hex);
    const params = `?${queryPath}&signature=${signature}`;
    return params;
  }
  generateExchangeSignature(queryParams: Object, data: string) {
    let queryPath = '';
    if (queryParams) {
      for (const i in queryParams) {
        if (Object.values(queryParams)[0] === queryParams[i]) {
          queryPath += `${i}=${queryParams[i]}`;
        } else {
          queryPath += `&${i}=${queryParams[i]}`;
        }
      }
    }
    console.log(queryPath);
    const signature = HmacSHA256(queryPath, data).toString(enc.Hex);
    const params = `${queryPath}&signature=${signature}`;
    return signature;
  }
}

export default new Helper();
