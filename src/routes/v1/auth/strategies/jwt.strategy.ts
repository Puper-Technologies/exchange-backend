import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwt } from '@config/constants';
import { JwtStrategyValidate } from '../interfaces/jwt-strategy-validate.interface';
import UsersEntity from '@v1/users/entities/user.entity';

@Injectable()
export default class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'accessToken',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secrets.accessToken,
    });
  }

  async validate(payload: UsersEntity): Promise<JwtStrategyValidate> {
    return {
      _id: payload._id,
      email: payload.email,
      role: payload.role,
    };
  }
}
