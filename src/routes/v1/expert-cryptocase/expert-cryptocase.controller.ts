import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseFilters, HttpCode, HttpStatus, NotFoundException, BadRequestException, Query, Put, UseGuards, Req } from '@nestjs/common';
import { ExpertCryptocasesService } from './expert-cryptocase.service';
import { CreateExpertCryptocaseDto } from './dto/create-expert-cryptocase.dto';
// import { UpdateExpertCryptocaseDto } from './dto/update-expert-cryptocase.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiExtraModels, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import ResponseWrapInterceptor from '@interceptors/response-wrap.interceptor';
import { ExpertCryptocase } from './entities/expert-cryptocase.entity';
import { HttpExceptionFilter, MongoExceptionFilter } from '@filters/http-Exception.filter';
import { CryptoWeight } from './entities/crypto-weight.entity';
// import Serialize from '@decorators/serialization.decorator';
import ExpertCryptocaseResponseEntity from './entities/expert-cryptocase-response.entity';
import ResponseUtil from '@utils/response.util';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { PaginatedExpertCryptocaseInterface } from '@interfaces/paginated-users.interface';
import PaginationUtil from '@utils/pagination.util';
import ParseObjectIdPipe from '@pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { AddCryptoWeightDto } from './dto/add-crypto-weight.dto';
import { UpdateCryptoWeightDto } from './dto/update-crypto-weight.dto';
// import JwtAccessGuard from '@guards/jwt-access.guard';
import RolesGuard from '@guards/roles.guards';
import { Roles, RolesEnum } from '@decorators/roles.decorator';
import { AuthenticationGuard } from '@guards/authentication.guard';
import { DomainType, SortOrderType, VolatilityType } from '@config/constants';
import {  UpdateCryptocaseWithCryptoWeightDto } from './dto/update-cryptocase-with-cryptoweight.dto';

@ApiTags('Crypto Cases')
@ApiBearerAuth()
@UseInterceptors(ResponseWrapInterceptor)
@ApiExtraModels(ExpertCryptocase, CryptoWeight)
@UseFilters(HttpExceptionFilter, MongoExceptionFilter)
// @UseGuards(AuthenticationGuard)
// @UseGuards(RolesGuard)
// @Roles(RolesEnum.ADMIN, RolesEnum.EXPERT)
@Controller('cryptocases')
export class ExpertCryptoCaseController {
  constructor(private readonly expertCryptocasesService: ExpertCryptocasesService) { }

  // createCryptocase
  @ApiBody({ type: CreateExpertCryptocaseDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExpertCryptocase),
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
        path: "/api/v1/cryptocase",
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
  @HttpCode(HttpStatus.CREATED)
  // @Serialize(ExpertCryptocaseResponseEntity)
  @Post()
  async createCryptocaseByExpert(@Body() createExpertCryptocaseDto: CreateExpertCryptocaseDto): Promise<ExpertCryptocaseResponseEntity> {
    // console.log('request recieved')
    const expertCryptocase: ExpertCryptocase = await this.expertCryptocasesService.createCryptocaseByExpert(createExpertCryptocaseDto);
    if (!expertCryptocase) {
      throw new NotFoundException('Unable to create new Crypto coin');
    }

    return ResponseUtil.success(
      'cryptocase',
      expertCryptocase,
    );
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExpertCryptocase),
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
        path: "/api/v1/cryptocase",
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
  // @Serialize(ExpertCryptocaseResponseEntity)
  @Get("/expert/:expertId")
  async findAllCryptocasesByExpert(@Param('expertId') expertId: string, @Query('page') page: any) {
    const paginationParams: PaginationParamsInterface | false = PaginationUtil.normalizeParams(page);
    if (!paginationParams) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const paginatedUsers: PaginatedExpertCryptocaseInterface = await this.expertCryptocasesService.findAllCryptocasesByExpert(expertId, paginationParams);

    return ResponseUtil.success(
      'expertCryptocases',
      paginatedUsers.paginatedResult,
      {
        location: 'expertCryptocases',
        paginationParams,
        totalCount: paginatedUsers.totalCount,
      },
    );
  }

  // - /getCryptoExpertCryptocaseById
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExpertCryptocase),
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
        path: "/api/v1/cryptocase",
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
  @Get(':id')
  async findCryptocaseById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId,) {
    // Need to enhance by checking verified
    const cryptocase = await this.expertCryptocasesService.findCryptocaseById(id);
    if (!cryptocase) {
      throw new NotFoundException(`Not Found crypto with id ${id}`);
    }

    return ResponseUtil.success(
      'cryptocase',
      cryptocase,
    );
  }

  // - /getAllCryptocaseList
  // @ApiOkResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       data: {
  //         $ref: getSchemaPath(ExpertCryptocase),
  //       },
  //     },
  //   },
  //   description: '200. Success. Returns a user',
  // })
  // @ApiNotFoundResponse({
  //   description: '404. NotFoundException. User was not found',
  // })
  // @ApiBadRequestResponse({
  //   schema: {
  //     type: 'object',
  //     example: {
  //       error: true,
  //       statusCode: 400,
  //       timestamp: Date,
  //       path: "req.url",
  //       details: {
  //         errorType: "ValidationError",
  //         errors: [
  //           {
  //             detail: "detail error message",
  //             source: {
  //               pointer: "attribute which has invalid data type"
  //             },
  //             meta: [
  //               "list of all validation exceptions solutions"
  //             ]
  //           }
  //         ]
  //       }
  //     },
  //   },
  //   description: '400. ValidationException',
  // })
  // @ApiUnauthorizedResponse({
  //   schema: {
  //     type: 'object',
  //     example: {
  //       error: true,
  //       statusCode: 401,
  //       timestamp: Date,
  //       path: "/api/v1/cryptocase",
  //       details: {
  //         statusCode: 401,
  //         message: "Unauthorized"
  //       }
  //     },
  //   },
  //   description: 'Token has been expired',
  // })
  // @ApiInternalServerErrorResponse({
  //   schema: {
  //     type: 'object',
  //     example: {
  //       error: true,
  //       statusCode: 400,
  //       timestamp: Date,
  //       path: "req.url",
  //       message: 'string',
  //       details: {
  //         statusCode: 500,
  //         message: "Error message",
  //         error: "Internal Server Error"
  //       },
  //     },
  //   },
  //   description: '500. InternalServerError',
  // })
  // // @Serialize(ExpertCryptocaseResponseEntity)
  // @Get()
  // async findAllCryptocases(@Query('page') pageNo: string, @Query('limit') size?: string,) {
  //   const pageQuery = {
  //     number: pageNo,
  //     limit: size || "10",
  //     size: size || "10"
  //   }
  //   // console.log(req.user)
  //   const paginationParams: PaginationParamsInterface | false = PaginationUtil.normalizeParams(pageQuery);
  //   if (!paginationParams) {
  //     throw new BadRequestException('Invalid pagination parameters');
  //   }

  //   const paginatedUsers: PaginatedExpertCryptocaseInterface = await this.expertCryptocasesService.findAllCryptocases(paginationParams);

  //   return ResponseUtil.success(
  //     'cryptocases',
  //     paginatedUsers.paginatedResult,
  //     {
  //       location: 'cryptocases',
  //       paginationParams,
  //       totalCount: paginatedUsers.totalCount,
  //     },
  //   );
  // }

  // - /addCryptoWeight
  @ApiBody({ type: AddCryptoWeightDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(CryptoWeight),
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
        path: "/api/v1/cryptoWeight",
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
  @Post('/cryptoweight')
  async createCryptoCoinWeightage(@Body() cryptoWeightdto: AddCryptoWeightDto) {
    const cryptoWeight = await this.expertCryptocasesService.createCryptoCoinWeight(cryptoWeightdto);
    if (!cryptoWeight) {
      throw new NotFoundException(`Unable to create new cryptoWeight`);
    }
    return ResponseUtil.success(
      'cryptoWeight',
      cryptoWeight,
    );
  }

  @ApiOkResponse({
    description: '200. Success. Returns all users',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExpertCryptocase),
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
  @Get('/cryptoweight/:id')
  async findCryptoCoinWeightById(@Param('id') id: string) {
    const cryptoWeight = await this.expertCryptocasesService.findCryptoCoinWeightById(new Types.ObjectId(id));
    if (!cryptoWeight) {
      throw new NotFoundException(`Unable to find cryptoWeight`);
    }

    return ResponseUtil.success(
      'cryptoWeight',
      cryptoWeight,
    );
  }

  // - /updateCryptoWeight
  @ApiOkResponse({
    description: '200. Success. Returns all users',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExpertCryptocase),
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
  @Put('/cryptoweight/:cryptoweightId/percent')
  async updateCryptoCoinWeightPercentById(@Param('cryptoweightId') cryptoWeightId: string, @Body() updateCryptoWeightDto: UpdateCryptoWeightDto) {
    const cryptoWeight = await this.expertCryptocasesService.updateCryptoCoinWeightPercentage(new Types.ObjectId(cryptoWeightId), updateCryptoWeightDto);
    if (!cryptoWeight) {
      throw new NotFoundException(`Unable to update cryptoWeight %`);
    }

    return ResponseUtil.success(
      'cryptoWeight',
      cryptoWeight,
    );
  }

  // - /changeWeightState
  @ApiOkResponse({
    description: '200. Success. Returns the updated cryptoweight',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExpertCryptocase),
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
  @Patch('/cryptoweight/:cryptoweightId/status')
  async updateCryptoCoinWeightStateById(@Param('cryptoweightId') crypotoWeightid: string, @Body() updateCryptoWeightDto: UpdateCryptoWeightDto) {
    const cryptoWeight = await this.expertCryptocasesService.updateCryptoCoinWeightState(crypotoWeightid, updateCryptoWeightDto);
    if (!cryptoWeight) {
      throw new NotFoundException(`Unable to update cryptoWeight state`);
    }

    return ResponseUtil.success(
      'cryptoWeight',
      cryptoWeight,
    );
  }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.expertCryptocaseService.remove(+id);
  // }
  // @Get('/aggregation')
  // getAggregate(@Query('symbol') symbol: string) {
  //   return this.expertCryptocasesService.getAggregation(symbol);
  // }
  @ApiOkResponse({
    description: '200. Success. Returns the updated cryptocase with its updated cryptoweights',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExpertCryptocase),
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
  @Patch('/:cryptocaseId')
  async updateListOfCryptoWeights(@Param('cryptocaseId') cryptocaseId: string, @Body() updateCryptocaseWithCryptoWeightDto : UpdateCryptocaseWithCryptoWeightDto){
    const updatedCryptocase = await this.expertCryptocasesService.updateListOfCryptoWeights(cryptocaseId, updateCryptocaseWithCryptoWeightDto);
    return ResponseUtil.success('cryptocase', updatedCryptocase);
  }

//   api/v1/cryptocases?category='NFT'&VOLATILITY='LOW'&isFree=false&tags=trending,topnft&symbol=SHIB,XRP&
// sort=date_asc
@ApiQuery({
  name: "domain",
  type: String,
  description: "name of the domain",
  required: false
})
@ApiQuery({
  name: "volatility",
  type: String,
  description: "No of records required",
  required: false
})
@ApiQuery({
  name: "symbol",
  type: String,
  description: "symbol of the coin",
  required: false
})
@ApiQuery({
  name: "quoteSymbol",
  type: String,
  description: "quote symbol",
  required: false
})
@ApiQuery({
  name: "search",
  type: String,
  description: "name of the cryptocase",
  required: false
})
@ApiQuery({
  name: "isFree",
  type: Boolean,
  description: "Fetch the free cryptocase",
  required: false
})
@ApiQuery({
  name: "symbol",
  type: String,
  description: "symbol of the coin",
  required: false
})
@ApiQuery({
  name: "sortByDate",
  type: String,
  description: "sort by created date in ascending(asc) or descending(dsc) order",
  required: false
})
@ApiQuery({
  name: "sortByNoOfCoins",
  type: String,
  description: "sort by no. of coin in cryptocase in ascending(asc) or descending(dsc) order",
  required: false
})
@ApiQuery({
  name: "sortByPricingWeekly",
  type: String,
  description: "sort weekly pricing of cryptocase in ascending(asc) or descending(dsc) order",
  required: false
})
@ApiQuery({
  name: "sortByPricingMonthly",
  type: String,
  description: "sort Monthly pricing of cryptocase in ascending(asc) or descending(dsc) order",
  required: false
})
@ApiQuery({
  name: "sortByPricingYearly",
  type: String,
  description: "sort Yearly pricing of cryptocase in ascending(asc) or descending(dsc) order",
  required: false
})
@ApiQuery({
  name: "limit",
  type: String,
  description: "No of records required",
  required: false
})
@ApiQuery({
  name: "page",
  type: String,
  description: "pass the page no to retrieve specific page data",
  required: false
})
@Get()
async getCryptocasesByQuery(
@Query('search') name?: string,
 @Query('domain') domain?: DomainType,
 @Query('volatility') volatility?: VolatilityType, 
 @Query('symbol') symbol ?:string, 
 @Query("quoteSymbol") quoteSymbol?: string,
 @Query("isFree") isFree?: string,
 @Query("page") pageNo?: string,
 @Query('limit') limit?:string,
 @Query('sortByDate') sortByDate?:SortOrderType,
 @Query('sortByNoOfCoins') sortByNoOfCoins?:SortOrderType,
 @Query('sortByPricingWeekly') sortByPricingWeekly?: SortOrderType,
 @Query('sortByPricingMonthly') sortByPricingMonthly?:SortOrderType,
 @Query('sortByPricingYearly') sortByPricingYearly?: SortOrderType,
  ){
  const pageQuery ={
    number: pageNo || "1",
    limit: limit || "10"
  }
  const paginationParams: PaginationParamsInterface | false = PaginationUtil.normalizeParams(pageQuery);
  if (!paginationParams) {
    throw new BadRequestException('Invalid pagination parameters');
  }


  const paginatedCryptocases = await this.expertCryptocasesService.getCryptocasesByQuery(
    name,
    domain,
    volatility,
    symbol,
    quoteSymbol,
    isFree,
    paginationParams,
    sortByDate,
    sortByNoOfCoins,
    sortByPricingWeekly,
    sortByPricingMonthly,
    sortByPricingYearly);

    return ResponseUtil.success(
      'cryptocases',
      paginatedCryptocases.paginatedResult,
      {
        location: `api/v1/cryptocases/`,
        paginationParams,
        totalCount: paginatedCryptocases.totalCount,
      },
    );
  }
}
