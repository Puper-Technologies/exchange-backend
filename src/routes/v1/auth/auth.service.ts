import { ForbiddenException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as lodash from 'lodash';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { OtpUserDto } from '@v1/users/dto/otp-user.dto';
import { UsersService } from '@v1/users/users.service';
import UserDto from '@v1/users/dto/user.dto';
import UsersEntity from '@v1/users/entities/user.entity';
import Helper from '@utils/helper.util';
import { JwtDecodedUser } from './interfaces/jwt-decoded-user.interface';
import { ValidateUserPayload } from './interfaces/validate-user-payload';
import { JwtService } from '@nestjs/jwt';
import { jwt } from '@config/constants';
import SendOtpUserDto from './dto/send-otp-user.dto';
import ValidateOtpUserDto from './dto/validate-otp-user.dto';
import { MyLogger } from '@shared/logger/logger.service';
import { SignUpDto } from '@v1/users/dto/sign-up.dto';
import { RolesEnum } from '@decorators/roles.decorator';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';
import { SignUpFirebaseDto } from '@v1/users/dto/sign-up-firebase.dto';
import { Types } from 'mongoose';
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService,private readonly firebaseAuthService:FirebaseAuthService, private logger: MyLogger) {
    this.logger.setContext(AuthService.name);
  }

  public async validateUser(
    email: string,
    password: string,
  ): Promise<null | ValidateUserPayload> {
    const user = await this.usersService.findByEmail(email) as UsersEntity;

    if (!user) {
      throw new NotFoundException('The item does not exist');
    }

    const passwordCompared = await bcrypt.compare(password, user.password);

    if (passwordCompared) {
      return {
        _id: user._id,
        email: user.email,
        role: user.role,
      };
    }

    return null;
  }

  /** steps for SignUp
   * validate mobileNo
   * check if user exist throw error
   * else save new user data
   * add role in temp array
   * create new user using user entity
   * encrypt password and save if password available 
   * else generate otp and save
   * store new created user in mongoose repositry
   * 
   * @param userDto 
   * @returns 
   */
  async signUp(userDto: SignUpDto): Promise<UsersEntity> {
    try {

      //get user using firebase 
      
      const user = await this.usersService.getUserByQuery({ email: userDto.email, mobileNo: userDto.mobileNo });
      if (!lodash.isEmpty(user)) {
        throw new NotAcceptableException("User already exist pls try with different credentials")
      }

      const password = await bcrypt.hash(userDto.password, 10);

      const otp: OtpUserDto = Helper.generateOtp(6);
      // newUserDto.otp.otpValue = otp.otpValue;
      // newUserDto.otp.expiryTime = otp.expiryTime;

      // newUserDto.exchange = []

      const newUserDto: UsersEntity = {
        authId:'',
        name: userDto.name,
        mobileNo: userDto.mobileNo,
        email: userDto.email,
        role: (userDto.role)? userDto.role : RolesEnum.USER,
        otp: otp,
        password: password,
        exchange: []
      };

      const createdUser = await this.usersService.create(newUserDto) as UsersEntity;
      return createdUser
    } catch (error) {
      throw new InternalServerErrorException(`Unexpected error occured in auth signUp method due to error: ${error.message}`);
    }
  }


  async signUpUsingFirebase(userDto : any ) : Promise<UsersEntity>{
    try {
          // check  user exist with the auth id provided
      const user = await this.usersService.getUserByQueryModified({ authId: userDto.authId });
      if (!lodash.isEmpty(user)) {
        throw new NotAcceptableException("User already exist pls try with different credentials")
      }
      const newUserDto: UsersEntity = {
        authId:userDto.authId,
        name: userDto.name,
        mobileNo: userDto.mobileNo,
        email: userDto.email,
        role: RolesEnum.USER,
        whatsappUpdate: userDto.whatsappUpdate,
        userSource: userDto.userSource
      };

      const createdUser = await this.usersService.create(newUserDto) as UsersEntity;
      return createdUser;
    } catch (error) {
      throw new InternalServerErrorException(`Unexpected error occured in auth signUp method due to error: ${error.message}`);
    }
  }

  /** steps for login
   * validate is incoming payload has necessary login data else throw error
   * check if user exist
   * check for user password matching using brcypt
   * check account status of user either enabled of disabled
   * generate payload using jwt token encryption
   * update user with auth token
   * pass the jwt token in cookies or header
   * return with gracefull message of successfully logged
   * 
   * @param loginAuthDto 
   * @returns 
   */
  async login(loginAuthDto: LoginAuthDto) {
    try {

      const payload: LoginAuthDto = {
        email: loginAuthDto.email,
        password: loginAuthDto.password,
        // mobileNo: loginAuthDto.mobileNo,
        // isMobileLogin: loginAuthDto.isMobileLogin
      }

      // if (payload.isMobileLogin) {
      //   if (lodash.isEmpty(payload.mobileNo)) {
      //     throw new NotFoundException("Please pass the valid mobile number.");
      //   }

      //   const user: UserDto = await this.usersService.findByEmail(payload.email);
      //   if (lodash.isEmpty(user)) {
      //     throw new UnauthorizedException("Unauthorised access pls try with valid user credentials.");
      //   }

      //   return user.otp

      // } else {
      if (lodash.isEmpty(payload.email) || lodash.isEmpty(payload.password)) {
        throw new NotFoundException("Please pass the valid email credentials.");
      }

      const user: UsersEntity = await this.usersService.findByEmail(payload.email);
      this.logger.log(`Successfully found user ${user.email}`)
      if (lodash.isEmpty(user)) {
        throw new UnauthorizedException("Unauthorised access pls try with valid user credentials.");
      }

      if (!bcrypt.compare(payload.password, user.password)) {
        throw new UnauthorizedException("Unauthorised access pls try with correct password.");
      }
      const jwtPayload: JwtDecodedUser = {
        _id: user._id,
        email: user.email,
        role: user.role,
        exp: 60,
      }
      return await this.generateAuthToken(jwtPayload)
      // }
    } catch (error) {
      throw new InternalServerErrorException(`Unexpected error occured in auth login method due to error: ${error.message}`);
    }
  }

  async verifyUser(email: string, verify: boolean) {
    const foundUser = await this.usersService.getUnverifiedUserByEmail(
      email
    ) as UsersEntity;

    if (!foundUser) {
      throw new NotFoundException('The user is either verified or data not available');
    }

    let user = await this.usersService.update(email, { verified: true })
    this.logger.warn(`Successfully found user ${user.email}`)
    return user

  }

  async sendLoginOtp(sendOtpUserDto: SendOtpUserDto) {
    // Validate and convert mobileNo in number

    //get the user with mobileNo
    const user = await this.usersService.getUserByMobileNo(sendOtpUserDto.mobileNo) as UsersEntity;
    this.logger.log(`Successfully found user with mobile no ${sendOtpUserDto.mobileNo}`);

    if (lodash.isEmpty(user)) {
      throw new NotFoundException('The user does not exist');
    }

    const otp: OtpUserDto = Helper.generateOtp(6);
    const updatedUser = await this.usersService.update(user.email, { otp })
    if (lodash.isEmpty(updatedUser)) {
      throw new Error("Unexpected Error occurred while sending otp");
    }
    this.logger.log(`Successfully generated the otp for user ${updatedUser.email}`);
    return otp
  }

  async validateOtp(validateOtpUserDto: ValidateOtpUserDto) {
    // Validate and convert mobileNo in number

    //get the user with mobileNo
    const user = await this.usersService.getUserByMobileNo(validateOtpUserDto.mobileNo) as UsersEntity;
    if (lodash.isEmpty(user)) {
      throw new NotFoundException('The user does not exist');
    }

    if (lodash.isEmpty(user.otp)) {
      throw new NotFoundException('Otp not found for user, please generate new otp');
    }

    if (!lodash.isEqual(user.otp.otpValue, validateOtpUserDto.otpValue)) {
      throw new NotAcceptableException("OTP validation failed, Please try with new otp");
    }

    // check if OTP expired
    const expiryTime = user.otp.expiryTime;
    const nowDate: Date = new Date();
    if (nowDate.getTime() > expiryTime) {
      throw new NotAcceptableException("OTP got Expired Pls try with new otp");
    }
    const payload: LoginAuthDto = {
      email: user.email,
      password: user.password,
    }

    this.logger.log(`Successfully verified the user ${user.email}`);
    return await this.login(payload);
  }

  // resendOtp(sendOtpUserDto: SendOtpUserDto) {
  //   return `This action removes a #${sendOtpUserDto} auth`;
  // }

  async generateAuthToken(jwtpayload: JwtDecodedUser) {
    const payload: JwtDecodedUser = {
      _id: jwtpayload._id,
      email: jwtpayload.email,
      role: jwtpayload.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwt.expirationTime.accessToken,
      secret: jwt.secrets.accessToken,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: jwt.expirationTime.refreshToken,
      secret: jwt.secrets.refreshToken,
    });

    await this.usersService.update(
      payload.email as string,
      { refreshToken },
    );

    this.logger.log(`Successfully generated the token for user the user ${payload.email}`);
    return {
      accessToken,
      refreshToken,
    };
  }

  public async verifyToken(token: string): Promise<JwtDecodedUser | null> {
    try {
      const secret = jwt.secrets.accessToken;
      const user = (await this.jwtService.verifyAsync(token, { secret })) as JwtDecodedUser | null;
      return user;
    } catch (error) {
      return null;
    }
  }
/**
 * 
 * @param authToken Bearer string appended with actual token   eg: "bearer {token}"
 * @returns firebase decoded result
 */
  public async verifyFirebaseToken (authToken:string): Promise<any | null> {
    try{
      
       const firebaseUser =  await this.firebaseAuthService.authenticateToken(authToken);
       return firebaseUser;
    }catch(err){
       throw new UnauthorizedException("invalid token");
    }
  }

  async logout(token: string) {
    const decodedUser: JwtDecodedUser | null = await this.verifyToken(
      token,
    );

    if (!decodedUser) {
      throw new ForbiddenException('Incorrect token');
    }

    const deletedUsersCount = await this.usersService.deleteTokenByEmail(
      decodedUser.email,
    );

    if (lodash.isEmpty(deletedUsersCount)) {
      throw new NotFoundException();
    }

    return deletedUsersCount
  }


   fetchUserByAuthId(authId:string) {
    return this.usersService.getUserByQueryModified({authId});
  }


  async getUserDataFromFirebaseToken(authToken :string){
    const decodedToken = await this.verifyFirebaseToken(authToken);
    return this.fetchUserByAuthId(decodedToken.uid);
  }

}
