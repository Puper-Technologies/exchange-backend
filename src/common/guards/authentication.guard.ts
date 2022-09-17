import { CanActivate, HttpException, HttpStatus, ExecutionContext, UnauthorizedException, Injectable } from "@nestjs/common";
import { FirebaseAuthService } from "@resources/firebase/firebase.service";
import { AuthService } from "@v1/auth/auth.service";
import { UsersService } from "@v1/users/users.service";
import * as lodash from 'lodash'
@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor( private readonly firebaseAuthService: FirebaseAuthService, private readonly usersService: UsersService ){}
    
    async verifyUsingFirebase(authorization){
        const { uid } = await this.firebaseAuthService.authenticateToken(authorization);
        return await this.usersService.getUserByQueryModified({ authId: uid });
    }


    // async verifyUsingJwt(authorization){
    //     const token = authorization.split(' ')[1];
    //     return await this.authService.verifyToken(token);
    // }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { headers: { authorization }} = request;
        if(!authorization) 
          throw new HttpException({message:"Token not provided"}, HttpStatus.BAD_REQUEST);
        // const { uid } = await this.firebaseAuthService.authenticateToken(authorization);
        // const user = await this.usersService.getUserByQueryModified({ authId: uid });
        const user = await this.verifyUsingFirebase(authorization);
        if(lodash.isEmpty(user)) 
           throw new UnauthorizedException();

        request.user = user;
        return true;
      }
}
