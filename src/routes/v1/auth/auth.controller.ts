import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  UnauthorizedException,
  Put,
  UseFilters,
  Headers,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
// import { LoginAuthDto } from './dto/login-auth.dto';
// import { OtpUserDto } from '@v1/users/dto/otp-user.dto';
// import UserDto from '@v1/users/dto/user.dto';
// import { SignUpDto } from '@v1/users/dto/sign-up.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import JwtTokensDto from './dto/jwt-token.dto';
// import LocalAuthGuard from '@guards/auth.guard';
// import JwtAccessGuard from '@guards/jwt-access.guard';
import UsersEntity from '@v1/users/entities/user.entity';
// import AuthBearer from '@decorators/auth-bearer.decorator';
// import { JwtDecodedUser } from './interfaces/jwt-decoded-user.interface';
import ResponseUtils from '@utils/response.util';
import UserResponseEntity from '@v1/users/entities/user-response.entity';
import Serialize from '@decorators/serialization.decorator';
import ResponseWrapInterceptor from '@interceptors/response-wrap.interceptor';
import { SuccessResponseInterface } from '@interfaces/success-response.interface';
import RolesGuard from '@guards/roles.guards';
import { Roles, RolesEnum } from '@decorators/roles.decorator';
import VerifyUserDto from './dto/verify-user.dto';
import SendOtpUserDto from './dto/send-otp-user.dto';
import ValidateOtpUserDto from './dto/validate-otp-user.dto';
import {
  HttpExceptionFilter,
  MongoExceptionFilter,
} from '@filters/http-Exception.filter';
import verifyUserDto from './dto/verify-user.dto';
import { ParseToken } from './dto/refresh-token.dto';
import { DoUserNotExist } from '@guards/do-not-user-exist.guard';
import { SignInProvider } from '@config/constants';
import { SignUpFirebaseDto } from '@v1/users/dto/sign-up-firebase.dto';
import { FirebaseGuard } from '@guards/firebase.guard';
import AuthenticatedUser from '@decorators/authenticated-user.decorator';
import { AuthenticationGuard } from '@guards/authentication.guard';
import { FirebaseDecodeResponse } from '@interfaces/firebase-decode-response.interface';
import { User } from '@v1/users/schemas/user.schema';
import { SignUpDto } from '@v1/users/dto/sign-up.dto';
import JwtAccessGuard from '@guards/jwt-access.guard';
import AuthBearer from '@decorators/auth-bearer.decorator';
import UserDto from '@v1/users/dto/user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import LocalAuthGuard from '@guards/auth.guard';
import { WalletService } from '@v1/wallet/wallet.service';
@ApiTags('Auth')
@ApiExtraModels(JwtTokensDto)
@UseInterceptors(ResponseWrapInterceptor)
@UseFilters(MongoExceptionFilter, HttpExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly walletService: WalletService,
    ) {}

  @ApiBody({ type: SignUpDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'user',
          $ref: getSchemaPath(UsersEntity),
        },
      },
    },
    description: '201, Success',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: "req.url",
        details: {
            errorType: "ValidationError",
            errors: [
                {
                    detail: "detail error message",
                    source: {
                        pointer: "attribute which has invalid data type"
                    },
                    meta: [
                        "list of all validation exceptions solutions"
                    ]
                }
            ]
        }
    },
    },
    description: '400. ValidationException',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: "req.url",
        message: 'string',
        details: {
          statusCode: 500,
          message: "Error message",
          error: "Internal Server Error"
      },
      },
    },
    description: '500. InternalServerError',
  })
  @ApiConflictResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '409. ConflictResponse',
  })
  @HttpCode(HttpStatus.CREATED)
  @Serialize(UserResponseEntity)
  @Post('signup')
  async signUp(@Body() userDto: SignUpDto) {

    const newUser = await this.authService.signUp(userDto) as UsersEntity
    // create wallet for the user
    await this.walletService.createWallet(newUser._id);

    const response = ResponseUtils.success(
      'user',
      new UsersEntity({
        _id: newUser._id,
        name: newUser.name,
        mobileNo: newUser.mobileNo,
        email: newUser.email,
        role: newUser.role,
        verified: newUser.verified
      }),
    );
    return response;
  }

  @ApiBearerAuth()
  @ApiBody({ type: SignUpFirebaseDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'user',
          $ref: getSchemaPath(UsersEntity),
        },
      },
    },
    description: '201, Success',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: 'req.url',
        details: {
          errorType: 'ValidationError',
          errors: [
            {
              detail: 'detail error message',
              source: {
                pointer: 'attribute which has invalid data type',
              },
              meta: ['list of all validation exceptions solutions'],
            },
          ],
        },
      },
    },
    description: '400. ValidationException',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: 'req.url',
        message: 'string',
        details: {
          statusCode: 500,
          message: 'Error message',
          error: 'Internal Server Error',
        },
      },
    },
    description: '500. InternalServerError',
  })
  @ApiConflictResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '409. ConflictResponse',
  })
  @UseGuards(DoUserNotExist)
  @HttpCode(HttpStatus.CREATED)
  @Serialize(UserResponseEntity)
  @Post('signupfirebase')
  async signUpFirebase(
    @Body() userDto: Partial<SignUpFirebaseDto>,
    @Req() request,
  ) {
    const decodedToken: FirebaseDecodeResponse = request.decodedToken;
    const provider = decodedToken.sign_in_provider;
    if (provider === SignInProvider.PHONE) {
      const user = {
        ...userDto,
        authId: decodedToken.uid,
        mobileNo: decodedToken.phone_number,
      };
      const newUser: UsersEntity = await this.authService.signUpUsingFirebase(
        user,
      );
      return ResponseUtils.success('user', newUser);
    } else {
      const user: SignUpFirebaseDto = {
        ...userDto,
        authId: decodedToken.uid,
        email: decodedToken.email,
      } as SignUpFirebaseDto;
      const newUser: UsersEntity = await this.authService.signUpUsingFirebase(
        user,
      );

      return ResponseUtils.success('user', newUser);
    }
  }

  /**
   * Login route handler
   * @param loginAuthDto request body
   * @returns
   */
  @ApiBody({ type: LoginAuthDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(JwtTokensDto),
        },
      },
    },
    description: 'Returns jwt tokens',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: "req.url",
        details: {
            errorType: "ValidationError",
            errors: [
                {
                    detail: "detail error message",
                    source: {
                        pointer: "attribute which has invalid data type"
                    },
                    meta: [
                        "list of all validation exceptions solutions"
                    ]
                }
            ]
        }
    },
    },
    description: '400. ValidationException',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: "req.url",
        message: 'string',
        details: {
          statusCode: 500,
          message: "Error message",
          error: "Internal Server Error"
      },
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return ResponseUtils.success(
      'tokens',
      await this.authService.login(loginAuthDto),
    );
  }

  @ApiNoContentResponse({
    description: 'No content. 204',
  })
  @ApiBody({ type: verifyUserDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(UsersEntity),
        },
      },
    },
    description: 'Returns jwt tokens',
  })
  @ApiNotFoundResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        error: 'Not Found',
      },
    },
    description: 'User was not found',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: 'req.url',
        details: {
          errorType: 'ValidationError',
          errors: [
            {
              detail: 'detail error message',
              source: {
                pointer: 'attribute which has invalid data type',
              },
              meta: ['list of all validation exceptions solutions'],
            },
          ],
        },
      },
    },
    description: '400. ValidationException',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: 'req.url',
        message: 'string',
        details: {
          statusCode: 500,
          message: 'Error message',
          error: 'Internal Server Error',
        },
      },
    },
    description: '500. InternalServerError',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('verifyuser')
  async verifyUser(
    @Body() verifyUserDto: VerifyUserDto,
  ): Promise<SuccessResponseInterface | never> {
    const newUser = (await this.authService.verifyUser(
      verifyUserDto.email,
      true,
    )) as UsersEntity;
    const response = ResponseUtils.success(
      'verified_user',
      new UsersEntity({
        _id: newUser._id,
        name: newUser.name,
        mobileNo: newUser.mobileNo,
        email: newUser.email,
        role: newUser.role,
        verified: true,
      }),
    );
    return response;
  }

  @ApiNoContentResponse({
    description: 'no content',
  })
  @ApiBody({type: verifyUserDto})
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(UserDto),
        },
      },
    },
    description: 'Returns jwt tokens',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
      error: true,
        statusCode: 401,
        timestamp: Date,
        path: "/api/v1/auth/logout",
        details: {
            statusCode: 401,
            message: "Unauthorized"
        }
    },
    },
    description: 'Token has been expired',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: "req.url",
        message: 'string',
        details: {
          statusCode: 500,
          message: "Error message",
          error: "Internal Server Error"
      },
      },
    },
    description: '500. InternalServerError',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@AuthBearer() token: string): Promise<{} | never> {
    const logout = await this.authService.logout(token);
    return ResponseUtils.success(
      "logout",
      logout
    )
  }

  @ApiBody({ type: SendOtpUserDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(JwtTokensDto),
        },
      },
    },
    description: 'Returns jwt tokens',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: "req.url",
        details: {
            errorType: "ValidationError",
            errors: [
                {
                    detail: "detail error message",
                    source: {
                        pointer: "attribute which has invalid data type"
                    },
                    meta: [
                        "list of all validation exceptions solutions"
                    ]
                }
            ]
        }
    },
    },
    description: '400. ValidationException',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
      error: true,
        statusCode: 401,
        timestamp: Date,
        path: "/api/v1/auth/logout",
        details: {
            statusCode: 401,
            message: "Unauthorized"
        }
    },
    },
    description: 'Token has been expired',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: "req.url",
        message: 'string',
        details: {
          statusCode: 500,
          message: "Error message",
          error: "Internal Server Error"
      },
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.OK)
  @Post('sendotp')
  async sendLoginOtp(@Body() sendOtpUserDto: SendOtpUserDto) {
    return ResponseUtils.success("otp",
    await this.authService.sendLoginOtp(sendOtpUserDto));
  }

  @ApiBody({ type: ValidateOtpUserDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(JwtTokensDto),
        },
      },
    },
    description: 'Returns jwt tokens',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        message: [
          {
            target: {
              email: 'string',
              password: 'string',
            },
            value: 'string',
            property: 'string',
            children: [],
            constraints: {},
          },
        ],
        error: 'Bad Request',
      },
    },
    description: '400. ValidationException',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: "req.url",
        message: 'string',
        details: {
          statusCode: 500,
          message: "Error message",
          error: "Internal Server Error"
      },
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.OK)
  @Post('validateotp')
  async validateOtp(@Body() validateOtpUserDto: ValidateOtpUserDto) {
    return ResponseUtils.success("tokens",
    await this.authService.validateOtp(validateOtpUserDto))
  }

  @ApiOkResponse({
    type: ParseToken,
    description: '200, returns a decoded user from access token',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: 'req.url',
        details: {
          errorType: 'ValidationError',
          errors: [
            {
              detail: 'detail error message',
              source: {
                pointer: 'attribute which has invalid data type',
              },
              meta: ['list of all validation exceptions solutions'],
            },
          ],
        },
      },
    },
    description: '400. ValidationException',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 401,
        timestamp: Date,
        path: '/api/v1/auth/token',
        details: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
    description: 'Token has been expired',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: 'req.url',
        message: 'string',
        details: {
          statusCode: 500,
          message: 'Error message',
          error: 'Internal Server Error',
        },
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @Get('token')
  async getUserByAccessToken(@AuthenticatedUser() user): Promise<any> {
    return ResponseUtils.success('user', new UsersEntity(user));
  }

  @ApiOkResponse({
    type: String,
    description: '200, returns a user from authId',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: 'req.url',
        details: {
          errorType: 'ValidationError',
          errors: [
            {
              detail: 'detail error message',
              source: {
                pointer: 'attribute which has invalid data type',
              },
              meta: ['list of all validation exceptions solutions'],
            },
          ],
        },
      },
    },
    description: '400. ValidationException',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 401,
        timestamp: Date,
        path: '/api/v1/auth/authId',
        details: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
    description: 'Token has been expired',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        error: true,
        statusCode: 400,
        timestamp: Date,
        path: 'req.url',
        message: 'string',
        details: {
          statusCode: 500,
          message: 'Error message',
          error: 'Internal Server Error',
        },
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @Get('authid/:authId')
  async getUserByAuthId(@Param('authId') authId: string): Promise<any> {
    const user = (await this.authService.fetchUserByAuthId(
      authId,
    )) as UsersEntity;
    return ResponseUtils.success('user', user);
  }
}
