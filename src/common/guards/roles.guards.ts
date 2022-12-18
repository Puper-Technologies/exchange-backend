import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';
import { FastifyRequest } from 'fastify';
import { JwtDecodeResponse } from '@interfaces/jwt-decode-response.interface';
import { RolesEnum } from '@decorators/roles.decorator';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';
import { AuthService } from '@v1/auth/auth.service';
import { UsersService } from '@v1/users/users.service';

@Injectable()
export default class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    // private jwtService: JwtService,
    private usersService: UsersService,
    private firebaseAuthService: FirebaseAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request: FastifyRequest = context.switchToHttp().getRequest();
    // const tokenData = (await this.jwtService.decode(request.headers.authorization?.split('Bearer')[1].trim() as string) as JwtDecodeResponse | null);
    const tokenData = await this.firebaseAuthService.authenticateToken(
      request.headers.authorization,
    );
    const userData = await this.usersService.getUserByQueryModified({
      authId: tokenData.uid,
    });
    // if (tokenData?.role === RolesEnum.ADMIN) {
    if (userData?.role === RolesEnum.ADMIN) {
      return true;
    }
    // return !tokenData ? false : roles.includes(tokenData?.role);
    return !userData ? false : roles.includes(userData?.role);
  }
}
