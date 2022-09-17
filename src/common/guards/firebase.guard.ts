import { CanActivate, createParamDecorator, ExecutionContext, HttpStatus, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
// import { NextFunction, Request, Response } from 'express';
import { FastifyRequest, FastifyReply,  } from 'fastify';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';
import { Observable } from 'rxjs';
import { UsersService } from '@v1/users/users.service';
import { FirebaseDecodeResponse } from '@interfaces/firebase-decode-response.interface';
export interface RequestModel extends FastifyRequest {
  user: any;
}
// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(private readonly firebaseService: FirebaseAuthService){}

//   public async use(req: RequestModel, _: FastifyReply, next: any) {
//     try {
//     const { authorization } = req.headers;
//     if (!authorization) {
//       throw new HttpException({ message: 'missing authz header' }, HttpStatus.BAD_REQUEST);
//     }
//     const user = await this.firebaseService.authenticate(authorization);
//     console.log("user in firebase",user);
//     req.user = user;
//     next();
//    } catch(err) {
//     throw new HttpException({ message: 'invalid token' }, HttpStatus.UNAUTHORIZED);
//    }
//   }
// }


@Injectable()
export class FirebaseGuard implements CanActivate {
  constructor(private readonly usersService : UsersService , private readonly firebaseAuthService: FirebaseAuthService){
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest();
    const { headers: { authorization }} = request;
    if(!authorization) 
      throw new HttpException({message:"Token not provided"}, HttpStatus.BAD_REQUEST);
    const { uid } = await this.firebaseAuthService.authenticateToken(authorization);
    const user = await this.usersService.getUserByQueryModified({ authId: uid });

    if(!user) throw new UnauthorizedException();

    request.user = user;
    return true;
  }
}