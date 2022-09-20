import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseInterceptors, HttpCode, HttpStatus, UseFilters, Query, BadRequestException, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { CryptocoinsService } from './cryptocoins.service';
import { CreateCryptocoinPairDto } from './dto/create-cryptocoin-pair.dto';
import { CreateCryptocoinDto } from './dto/create-cryptocoin.dto';
// import { UpdateCryptocoinDto } from './dto/update-cryptocoin.dto';
import ResponseUtil from '@utils/response.util';
import CryptocoinResponseEntity from './entities/cryptocoin-response.entity';
import { Cryptocoin } from './entities/cryptocoin.entity';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiExtraModels, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import ResponseWrapInterceptor from '@interceptors/response-wrap.interceptor';
import Serialize from '@decorators/serialization.decorator';
import { HttpExceptionFilter, MongoExceptionFilter } from '@filters/http-Exception.filter';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import PaginationUtil from '@utils/pagination.util';
import { PaginatedCryptocoinsInterface } from '@interfaces/paginated-users.interface';
import ParseObjectIdPipe from '@pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
// import JwtAccessGuard from '@guards/jwt-access.guard';
import RolesGuard from '@guards/roles.guards';
import { Roles, RolesEnum } from '@decorators/roles.decorator';
import { CoinPair } from './entities/coin-pair.entity';
import { AuthenticationGuard } from '@guards/authentication.guard';
import { Platform } from '@config/constants';


@ApiTags('cryptocoins')
@ApiBearerAuth()
@UseInterceptors(ResponseWrapInterceptor)
@ApiExtraModels(Cryptocoin)
@UseFilters(HttpExceptionFilter, MongoExceptionFilter)
// @UseGuards(AuthenticationGuard)
// @UseGuards(RolesGuard)
// @Roles(RolesEnum.ADMIN, RolesEnum.EXPERT)
@Controller('cryptocoins')
export class CryptocoinsController {
  constructor(private readonly cryptocoinsService: CryptocoinsService) { }

  // addCryptoCurrency
  @ApiBody({ type: CreateCryptocoinDto })
  @ApiOkResponse({
    description: '201, Success',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        message: [
          {
            target: {
              name: 'string',
              symbol: 'string',
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
  @ApiConflictResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '409. ConflictResponse',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        details: {},
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.CREATED)
  @Serialize(CryptocoinResponseEntity)
  @Post()
  async addCryptoCoin(@Body() createCryptocoinDto: Partial<CreateCryptocoinDto>): Promise<CryptocoinResponseEntity> {
    const newCoin = await this.cryptocoinsService.addCryptoCurrency(createCryptocoinDto);
    if (!newCoin) {
      throw new NotFoundException('Unable to create new Crypto coin');
    }

    return ResponseUtil.success(
      'cryptocoins',
      newCoin,
    );
  }

  // @ApiBody({ type: CreateCryptocoinDto })
  @ApiOkResponse({
    description: '201, Success',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        message: [
          {
            target: {
              name: 'string',
              symbol: 'string',
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
  @ApiConflictResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '409. ConflictResponse',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        details: {},
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.CREATED)
  @Serialize(CryptocoinResponseEntity)
  @Post("/:exchange")
  async addPlatformCryptoCoin(@Param('exchange') exchange: string, @Query('qsymbol') quoteSymbol: string, @Query('cmcKey') cmcKey: string): Promise<CryptocoinResponseEntity> {

    const cryptoExchange = Platform[exchange.toUpperCase()] || null
    // console.log(`exchange name `, exchange, platform[exchange.toUpperCase()], cryptoExchange)
    if (cryptoExchange === null) {
      throw new NotFoundException(`Currently we don't support exchange ${exchange}`);
    }

    const exchangeSupportedCoins = await this.cryptocoinsService.addExchangeCryptoCurrencies(cryptoExchange, quoteSymbol, cmcKey);
    if (!exchangeSupportedCoins) {
      throw new NotFoundException(`Unable to Add crypto coins for exchange ${cryptoExchange} try it manually`);
    }

    return ResponseUtil.success(
      'cryptocoins',
      {"message": `successfully added crypto currencies for exchange ${cryptoExchange}`,
        "status": "SUCCESS",
        "count": exchangeSupportedCoins
      },
    );
  }

  // - /getCryptoCurrencyList
  @ApiOkResponse({
    description: '200. Success. Returns all supported cryptocoins',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(Cryptocoin),
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
  @Get()
  @Serialize(CryptocoinResponseEntity)
  @ApiQuery({
    name: "search",
    type: String,
    description: "Coin name or symbol",
    required: false
  })
  @ApiQuery({
    name: "qsymbol",
    type: String,
    description: "Quote symbol for coin for which price need to be shown",
    required: true
  })
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
  async findAllCryptoCoins(@Query('qsymbol') quoteSymbol : string,@Query('search') search : string, @Query('page') pageNo: string, @Query('limit') limit?: string): Promise<CryptocoinResponseEntity> {
    const pageQuery ={
      number: pageNo || "1",
      limit: "10",
      size: limit || "10"
    }
    const paginationParams: PaginationParamsInterface | false = PaginationUtil.normalizeParams(pageQuery);
    if (!paginationParams) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const paginatedUsers: PaginatedCryptocoinsInterface = await this.cryptocoinsService.findAllCryptoCoins(quoteSymbol, search, paginationParams);

    return ResponseUtil.success(
      'cryptocoins',
      paginatedUsers.paginatedResult,
      {
        location: 'api/v1/cryptocoins',
        paginationParams,
        totalCount: paginatedUsers.totalCount,
      },
    );
  }

  // - /getCryptoCurrencyById

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(Cryptocoin),
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
        path: "/api/v1/cryptocoins/:cryptocoinId",
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
  @Get('/:id')
  async findCryptoCoinById(@Param('id') id: string) {
    // Need to enhance by checking verified
    const cryptocoin = await this.cryptocoinsService.findCryptoCoinById(new Types.ObjectId(id));
    if (!cryptocoin) {
      throw new NotFoundException(`Not Found crypto with id ${id}`);
    }

    return ResponseUtil.success(
      'cryptocoin',
      cryptocoin,
    );
  }

  // - /getCryptoCurrencyBySymbol
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(Cryptocoin),
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
  @Get('/symbol/:symbol')
  async findCryptoCoinsBySymbol(@Param('symbol') symbol: string) {
    // Need to enhance by checking verified
    const cryptocoin = await this.cryptocoinsService.findCryptoCoinsBySymbol(symbol);
    if (!cryptocoin) {
      throw new NotFoundException(`Not Found crypto with symbol ${symbol}`);
    }

    return ResponseUtil.success(
      'cryptocoin',
      cryptocoin,
    );
  }

  // - /addCurrencyPair
  @ApiBody({ type: CreateCryptocoinPairDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(CoinPair),
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
  @Post('/coinpair')
  async addCoinsPair(@Body() createCryptocoinPairDto: CreateCryptocoinPairDto) {
    const coinsPair = await this.cryptocoinsService.addCoinsPair(createCryptocoinPairDto);
    if (!coinsPair) {
      throw new NotFoundException('Unable to create new coin pair');
    }

    return ResponseUtil.success(
      'coinpair',
      coinsPair,
    );
  }

  // @Get('/coinpair')
  // async findAllCoinsPair(@Body() createCryptocoinPairDto: CreateCryptocoinPairDto) {
  //   const coinsPair = await this.cryptocoinsService.addCoinsPair(createCryptocoinPairDto);
  //   if (!coinsPair) {
  //     throw new NotFoundException('Unable to create new coin pair');
  //   }

  //   return ResponseUtil.success(
  //     'coinpair',
  //     coinsPair,
  //   );
  // }

  // - /getCurrencyPairByBaseSymbolAndQuoteSymbol
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(CoinPair),
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
  @Get('/coinpair/:basesymbol/:quotesymbol')
  async findCoinsPairByBaseSymbolAndQuoteSymbol(@Param('basesymbol') baseSymbol: string, @Param('quotesymbol') quoteSymbol: string) {
    const coinPair = await this.cryptocoinsService.findCoinsPairByBaseSymbolAndQuoteSymbol(baseSymbol, quoteSymbol);
    if (!coinPair) {
      throw new NotFoundException(`Not Found coin pair with basesymbol ${baseSymbol} and quoteSymbol ${quoteSymbol}`);
    }

    return ResponseUtil.success(
      'coinpair',
      coinPair,
    );
  }
  
  // - /getCoinsPairByBaseSymbol
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(CoinPair),
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
  @Get('/coinpair/base/:basesymbol')
  findCoinsPairByBaseSymbol(@Param('basesymbol') baseSymbol: string) {
    return this.cryptocoinsService.findCoinsPairByBaseSymbol(baseSymbol);
  }

  // - /getCoinsPairListByQuoteSymbol
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(CoinPair),
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
  @Get('/coinpair/quote/:quotesymbol')
  findCoinsPairListByQuoteSymbol(@Param('quotesymbol') quoteSymbol: string) {
    return this.cryptocoinsService.findCoinsPairListByQuoteSymbol(quoteSymbol);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCryptocoinDto: UpdateCryptocoinDto) {
  //   return this.cryptocoinsService.update(+id, updateCryptocoinDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.cryptocoinsService.remove(+id);
  // }
}
