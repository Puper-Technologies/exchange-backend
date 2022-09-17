import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  NotFoundException,
  Query,
  BadRequestException,
  UseFilters,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpDto } from './dto/sign-up.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import UserDto from './dto/user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiExtraModels, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import ResponseWrapInterceptor from '@interceptors/response-wrap.interceptor';
import UserResponseEntity from './entities/user-response.entity';
import { User } from './schemas/user.schema';
import Serialize from '@decorators/serialization.decorator';
import JwtAccessGuard from '@guards/jwt-access.guard';
import { Types } from 'mongoose';
import ParseObjectIdPipe from '@pipes/parse-object-id.pipe';
import ResponseUtil from '@utils/response.util';
import PaginationUtils from '@utils/pagination.util'
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { PaginatedUsersInterface } from '@interfaces/paginated-users.interface';
import RolesGuard from '@guards/roles.guards';
import { Roles, RolesEnum } from '@decorators/roles.decorator';
import { HttpExceptionFilter, MongoExceptionFilter } from '@filters/http-Exception.filter';
import { AddUserAccountKeyDto } from './dto/user-account-key.dto';
import { FirebaseGuard } from '@guards/firebase.guard';
import UserEntity from './entities/user.entity'
import { AuthenticationGuard } from '@guards/authentication.guard';
import { FastifyReply, FastifyRequest } from 'fastify';
import UploadImageS3 from '@utils/upload-s3.service'

@ApiTags('users')
@ApiBearerAuth()
@UseInterceptors(ResponseWrapInterceptor)
@UseFilters(MongoExceptionFilter, HttpExceptionFilter)
@ApiExtraModels(User)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
    description: '200. Success. Returns a user',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException. User was not found',
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
  @ApiParam({ name: 'id', type: String })
  @Get('/:id')
  @Serialize(UserResponseEntity)
  // @UseGuards(JwtAccessGuard)
  @UseGuards(AuthenticationGuard)
  async getVerifiedUserById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId,): Promise<UserResponseEntity> {
    // Need to enhance by checking verified
    const foundUser = await this.usersService.getVerifiedUserById(id);
    if (!foundUser) {
      throw new NotFoundException('Not Found verified user');
    }

    return ResponseUtil.success(
      'users',
      foundUser,
    );
  }

  @ApiOkResponse({
    description: '200. Success. Returns all users',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })


  // issue 
  // @Get()
  // @Serialize(UserResponseEntity)
  // // @UseGuards(AuthenticationGuard)
  // // @UseGuards(RolesGuard)
  // // @Roles(RolesEnum.ADMIN)
  // async getAllVerifiedUsers(@Query() query: any): Promise<UserResponseEntity> {
    
  //   const paginationParams: PaginationParamsInterface | false = PaginationUtils.normalizeParams(query.page);
  //   if (!paginationParams) {
  //     throw new BadRequestException('Invalid pagination parameters');
  //   }

  //   const paginatedUsers: PaginatedUsersInterface = await this.usersService.getAllVerifiedWithPagination(paginationParams);
  //   return ResponseUtil.success(
  //     'users',
  //     paginatedUsers.paginatedResult,
  //     {
  //       location: 'users',
  //       paginationParams,
  //       totalCount: paginatedUsers.totalCount,
  //     },
  //   );
  // }

  @Get()
  @Serialize(UserResponseEntity)
  // @UseGuards(AuthenticationGuard)
  // @UseGuards(RolesGuard)
  // @Roles(RolesEnum.ADMIN)
  @ApiQuery({
    name: "page",
    type: String,
    description: "pass the page no to retrieve specific page data",
    required: false
  })
  @ApiQuery({
    name: "limit",
    type: String,
    description: "No of records required",
    required: false
  })
  async getAllUsers(@Query('page') pageNo: string, @Query('limit') limit?: string): Promise<UserResponseEntity> {
    const pageQuery ={
      number: pageNo || "1",
      limit: "10",
      size: limit || "10"
    }
    const paginationParams: PaginationParamsInterface | false = PaginationUtils.normalizeParams(pageQuery);
    if (!paginationParams) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const paginatedUsers: PaginatedUsersInterface = await this.usersService.getAllUsersWithPagination(paginationParams);
    return ResponseUtil.success(
      'users',
      paginatedUsers.paginatedResult,
      {
        location: 'users',
        paginationParams,
        totalCount: paginatedUsers.totalCount,
      },
    );
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
    description: '200. Success. Returns a user',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException. User was not found',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })
  // @ApiParam({ mobNo: 'mobNo', type: String })
  @Serialize(UserResponseEntity)
  @UseGuards(AuthenticationGuard)
  @Get('/mob/:mobNo')
  async getUserByMobileNumber(@Param('mobNo') mobNo: string): Promise<UserResponseEntity> {
    const result = await this.usersService.getUserByMobileNo(mobNo) as UserEntity;
    if(!result)
      throw new NotFoundException(`User not found with mobileNo ${mobNo}`);

    return ResponseUtil.success(
      'user',
      new UserEntity({
        _id:result._id,
        authId:result.authId,
        name:result.name,
        email:result.email,
        mobileNo:result.mobileNo,
        role: result.role
      })
    )
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
    description: '200. Success. Returns a user',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException. User was not found',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })
  @Serialize(UserResponseEntity)
  @UseGuards(AuthenticationGuard)
  @Patch('/:id')
  async updateUserDetails(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
    description: '200. Success. Returns a user',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException. User was not found',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })
  @Serialize(UserResponseEntity)
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @Post('/:platform/accountKey')
  async addUserAccountKey(
    @Body() addUserAccountKey: AddUserAccountKeyDto,
    @Param('platform') exchangeName: string) {
      const result = await this.usersService.addUserBinanceAccountKeys(addUserAccountKey, exchangeName);

      if(!result)
        throw new NotFoundException(`User account key Updation failed`);

      return ResponseUtil.success(
        'accountKey',
        result
      );
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
    description: '200. Success. Returns a user',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException. User was not found',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })
  @Serialize(UserResponseEntity)
  @UseGuards(AuthenticationGuard)
  @Get('/:platform/:userid/accountKey')
  async getUserAccountKey(
    @Param('userid') userId: string,
    @Param('platform') exchangeName: string
  ): Promise<any> {
    const result = await this.usersService.getUserAccountKey(userId, exchangeName);

      if(!result)
        throw new NotFoundException(`Unable to find account key`);

      return ResponseUtil.success(
        'accountKey',
        result
      );
  }

  // @Post('/:id/subscribe/:caseId')
  // async subscribeExpertPortfolio(
  //   @Param('id') userId: string,
  //   @Param('caseId') portfolioId: string) {
  //   return await this.usersService.subscribeExpertPortfolio(new Types.ObjectId(userId), new Types.ObjectId(portfolioId))
  // }


  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return await this.usersService.remove(id);
  // }


  @UseGuards(AuthenticationGuard)
  @Post('/upload/image')
  async uploadImage(@Req() req: FastifyRequest)
  {
    
    const imageResponse =  await this.usersService.uploadImage(req);

    return ResponseUtil.success('image', imageResponse);


  }
}
