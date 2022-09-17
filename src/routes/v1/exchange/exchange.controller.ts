import { Controller, Get, Param, Query, Post, Body, BadRequestException, UseFilters, UseInterceptors, UseGuards } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { HttpService } from '@nestjs/axios';
import { SymbolFilterDto } from './dto/symbol-filter.dto';
import { CreateNewOrderDto } from './dto/create-order.dto';
import { Types } from 'mongoose';
import { TransactionDto } from './dto/transaction.dto';
import ResponseUtil from '@utils/response.util';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import PaginationUtil from '@utils/pagination.util';
import { PaginatedTransactionInterface } from '@interfaces/paginated-users.interface';
import { HttpExceptionFilter, MongoExceptionFilter } from '@filters/http-Exception.filter';
import ResponseWrapInterceptor from '@interceptors/response-wrap.interceptor';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import { ExchangeInfo } from './entities/exchange-info.entity';
import { UserExchangeAccountInfo } from './entities/user-exchange-account-info.entity';
import { TickerPriceChangeStats } from './entities/ticker-price-change-stats.entity';
import { CurrentPrice } from './entities/current-price.entity';
import JwtAccessGuard from '@guards/jwt-access.guard';
import RolesGuard from '@guards/roles.guards';
import { Roles, RolesEnum } from '@decorators/roles.decorator';
import { AuthenticationGuard } from '@guards/authentication.guard';
import { Period } from '@config/constants';
//@ApiExtraModels(JwtTokensDto)
@ApiTags('exchangeApi')
@UseInterceptors(ResponseWrapInterceptor)
@UseFilters(HttpExceptionFilter, MongoExceptionFilter)
@UseGuards(AuthenticationGuard)
@ApiBearerAuth()
// @UseGuards(RolesGuard)
// @Roles(RolesEnum.ADMIN, RolesEnum.EXPERT)
@Controller('exchange')
export class ExchangeController {
  constructor(
    private readonly exchangeService: ExchangeService,
    private httpService: HttpService,
  ) {}

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExchangeInfo),
        },
      },
    },
    description: '200. Success',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException',
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
  // @Serialize(UserResponseEntity)
  // @UseGuards(JwtAccessGuard)
  @Get(':platform/info')
  getExchangeInfo(@Param('platform') platform: string,symbol:string) {
    return this.exchangeService.getExchangeInfo(platform,symbol);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(UserExchangeAccountInfo),
        },
      },
    },
    description: '200. Success',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException',
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
  @Get(':platform/:userId/accountInfo')
  async getUserExchangeAccountInfo(
    @Param('userId') userId: string,
    @Param('platform') exchangeName: string,
  ) {
    return await this.exchangeService.getUserAccountInfo(userId, exchangeName);
  }

  
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(TickerPriceChangeStats),
        },
      },
    },
    description: '200. Success.',
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
  @Get(':platform/tickerPriceStatistics')
  //@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
  async get24hrTickerPriceChangeStatistics(
    @Param('platform') platform: string,
    @Query('symbol') symbol: string,
  ) {
    console.log("symbol", symbol)
    return await this.exchangeService.get24hrTickerPriceChangeStatistics(platform, symbol);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(CurrentPrice),
        },
      },
    },
    description: '200. Success. Returns a user',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException. CurrentPrice for symbol was not found',
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
  @Get(':platform/symbol/currentPrice')// check for multiple symbol
  async getSymbolCurrentPrice(
    @Param('platform') platform: string,
    @Query('symbol') symbol: string,
  ) {
    return await this.exchangeService.getSymbolCurrentPrice(platform, symbol);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          
        },
      },
    },
    description: '200. Successfilly subscribed the portfolio',
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
  @Post(':platform/:userId/neworder')
  async createNewOrder(
    @Param('platform') platform: string,
    @Param('userId') userId: string,
    @Body() createNewOrder: CreateNewOrderDto,
  ) {
    return await this.exchangeService.createNewOrder(
      userId,
      platform,
      createNewOrder,
    );
  }

  //*********************Transactions*************************************/

  @Post(':platform/transactions/:userId')
  async createNewUserTransaction(
    @Param('platform') platform: string,
    @Param('userId') userId: string,
    @Body() createNewOrder: TransactionDto,
  ) {
    return await this.exchangeService.createNewUserTransaction(
      platform,
      new Types.ObjectId(userId),
      createNewOrder,
    );
  }



  @Get(':platform/transactions/:userId')
  async getUserTransactionList(@Param('platform') platform: string,
  @Param('userId') userId: string, @Query('page') page: any) {
    const paginationParams: PaginationParamsInterface | false = PaginationUtil.normalizeParams(page);
    if (!paginationParams) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const paginatedUsers: PaginatedTransactionInterface = await this.exchangeService.getUserTransactionList(
      platform,
      new Types.ObjectId(userId),
      paginationParams,
    );

    return ResponseUtil.success(
      'userTransactions',
      paginatedUsers.paginatedResult,
      {
        location: 'userTransactions',
        paginationParams,
        totalCount: paginatedUsers.totalCount,
      },
    );
  }

  // ********************************Portfolio subscription api(NEED to replace it on some other module)
  @Post('/:userid/subscribe/:caseId')
  async subscribeExpertPortfolio(
    @Param('userid') userId: string,
    @Param('caseId') portfolioId: string) {
    return await this.exchangeService.subscribeExpertPortfolio(new Types.ObjectId(userId), new Types.ObjectId(portfolioId))
  }


  @Get('/history/:exchange/:coinpair')
  getHistoricalData(@Param('exchange') exchange: string, @Param('coinpair') coinpair: string, @Query('after') after: Date, @Query('before') before: Date , @Query('periods') periods: string ){
    return this.exchangeService.getHistoricalExchangeData(exchange, coinpair, after, before, periods);
  }


}





