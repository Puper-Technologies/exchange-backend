import { CanActivate, ExecutionContext, HttpStatus, Injectable, UnauthorizedException, HttpException } from "@nestjs/common";
import { FirebaseAuthService } from "@resources/firebase/firebase.service";
import { UsersService } from "@v1/users/users.service";
import { Observable } from "rxjs";

/**
 * this guard checks whether user already exist or not, if not exist then allow user creation
 */

@Injectable()
export class DoUserNotExist implements CanActivate{
    constructor(private readonly firebaseAuthService :FirebaseAuthService, private readonly userService:UsersService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { headers : { authorization } } = request;
        if(!authorization) throw new HttpException({ message: 'missing authz header' }, HttpStatus.BAD_REQUEST);
        const decodedToken = await this.firebaseAuthService.authenticateToken(authorization);
        // check whether the user exist with this userId
        const user = await this.userService.getUserByQueryModified({ authId:decodedToken.uid });
        if(user) 
            throw new HttpException({message:"User already exist with the provided credentials"}, HttpStatus.BAD_REQUEST);
        request.decodedToken = decodedToken;
        return true;
    }
}

