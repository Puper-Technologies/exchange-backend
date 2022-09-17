import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as CONSTANT from '@config/message.constants';
// import admin from '../../main';
import * as admin from 'firebase-admin';
// import { MyLogger } from '@shared/logger/logger.service';
import { getAuth, getRedirectResult, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { UsersService } from '@v1/users/users.service';
import { FirebaseDecodeResponse } from '@interfaces/firebase-decode-response.interface';
const provider = new GoogleAuthProvider();

@Injectable()
export class FirebaseAuthService {

  constructor(
    // private logger: MyLogger,
    
  ) { }

  private getToken(authToken: string): string {
    const match = authToken.match(/^Bearer (.*)$/);
    if (!match || match.length < 2) {
      throw new UnauthorizedException(CONSTANT.INVALID_BEARER_TOKEN);
    }
    return match[1];
  }

  public async authenticate(authToken: string): Promise<any> {
    const auth = getAuth();
    const tokenString = this.getToken(authToken);
    try {
      const decodedToken: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(tokenString);
      console.log(`${JSON.stringify(decodedToken)}`);
      console.log('decoded token',decodedToken);
      const {
        email,
        uid,
        role,
      } = decodedToken;
      return { email, uid, role };
    } catch (err) {
      console.log(`error while authenticate request ${err.message}`)
      throw new UnauthorizedException(err.message);
    }
  }

// new implementation
/**
 * decode the token and return the decoded token result
 * @param authToken the authorization token 
 * @returns-- { email, phone_number, uid, sign_in_provider}
 */
  public async authenticateToken(authToken:string) :Promise<FirebaseDecodeResponse>{
    try {
      const tokenString = this.getToken(authToken);
      const decodedToken = await admin.auth().verifyIdToken(tokenString);
      if(!decodedToken) throw new HttpException({message:"token invalid or expired"}, HttpStatus.NOT_ACCEPTABLE)
      const { email = undefined, phone_number = undefined, uid ,firebase:{ sign_in_provider } } = decodedToken;
      return { email, phone_number, uid, sign_in_provider };
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }

  public async signUp() {
    const auth = getAuth();
    signInWithRedirect(auth, provider);
    getRedirectResult(auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;
        console.log("user details in firebase", user)
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }
}