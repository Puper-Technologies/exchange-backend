import { CRYPTO_DATA, Platform, TransactionType } from '@config/constants';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MyLogger } from '@shared/logger/logger.service';
import { UsersService } from '@v1/users/users.service';
import Helper from '@utils/helper.util';
import { HttpService } from '@nestjs/axios';
import * as lodash from 'lodash';
import { map } from 'rxjs/operators';
import { SymbolFilterDto } from './dto/symbol-filter.dto';
import { CreateNewOrderDto } from './dto/create-order.dto';
import ExchangeRepository from './repositories/exchange.repository';
import { Types } from 'mongoose';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { PaginatedTransactionInterface } from '@interfaces/paginated-users.interface';
import UsersEntity from '@v1/users/entities/user.entity';
import { ExpertCryptocasesService } from '@v1/expert-cryptocase/expert-cryptocase.service';
import { ExpertCryptocase } from '@v1/expert-cryptocase/entities/expert-cryptocase.entity';
import { UserExchangeAccountInfo } from './entities/user-exchange-account-info.entity';
import { Balance } from './entities/balance.entity';
import { CryptoWeight } from '@v1/expert-cryptocase/entities/crypto-weight.entity';
import { CryptocoinsService } from '@v1/cryptocoins/cryptocoins.service';
import { CurrentPrice } from './entities/current-price.entity';
import { NewOrderResponse } from './entities/new-order-response.entity';

@Injectable()
export class ExchangeService {
  constructor(
    @Inject(forwardRef(() => ExpertCryptocasesService))
    private readonly expertCryptocase: ExpertCryptocasesService,
    private readonly userService: UsersService,
    private readonly cryptoCoinsService: CryptocoinsService,
    private logger: MyLogger,
    private readonly exchangeRepository: ExchangeRepository,
    private transactionRepository: TransactionRepository,
  ) {
    this.logger.setContext(ExchangeService.name);
  }

  async getExchangeInfo(platform: string, symbol?: string) {
    return await this.exchangeRepository.getExchangeInfo(platform, symbol);
  }

  async get24hrTickerPriceChangeStatistics(platform: string, symbol: string) {
    // this.logger.debug(symbol)
    return await this.exchangeRepository.get24hrTickerPriceChangeStatistics(
      platform,
      symbol,
    );
  }

  async getUserAccountInfo(
    userId: string,
    exchangeName: string,
  ): Promise<UserExchangeAccountInfo> {
    try {
      const userData = await this.userService.getUserAccountKey(
        userId,
        exchangeName,
      );
      const userSecretCredentals = lodash.find(userData[0]['exchange'], {
        exchangeName: exchangeName,
      });
      const apiKey = userSecretCredentals.apiKey;
      const secretKey = userSecretCredentals.secretKey;
      const queryParams = new Object();
      queryParams['timestamp'] = Date.now();
      const getQueryParams = Helper.generateSignature(queryParams, secretKey);
      const setHeaders = {
        'x-mbx-apiKey': apiKey,
      };

      this.logger.debug(
        CRYPTO_DATA[exchangeName].BASE_URL +
          CRYPTO_DATA[exchangeName].ACCOUNT_INFO +
          getQueryParams,
      );
      return await this.exchangeRepository.getUserAccountInfo(
        exchangeName,
        getQueryParams,
        setHeaders,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error occurred while  getting account info on exchange ${exchangeName} and userID ${userId} due to : ${error.message}`,
      );
    }
  }

  async getSymbolCurrentPrice(
    platform: string,
    symbol: string,
  ): Promise<CurrentPrice> {
    this.logger.log(
      `Fetching the current symbol price for ${symbol} on exchange ${platform}`,
    );
    return (await this.exchangeRepository.getSymbolCurrentPrice(
      platform,
      symbol,
    )) as CurrentPrice;
  }

  async getAllSymbolCurrentPrice(platform: string): Promise<CurrentPrice[]> {
    return (await this.exchangeRepository.getSymbolCurrentPrice(
      platform,
    )) as CurrentPrice[];
  }

  async createNewOrder(
    userId: string,
    platform: string,
    createNewOrder: CreateNewOrderDto,
  ): Promise<NewOrderResponse> {
    try {
      const { symbol, side, type, quantity, quoteOrderQty, newOrderResp } =
        createNewOrder;
      const queryParams = new Object();
      queryParams['symbol'] = symbol;
      queryParams['side'] = side;
      queryParams['type'] = type;
      queryParams['quantity'] = quantity;
      // queryParams['quoteOrderQty'] = quoteOrderQty
      // queryParams['newOrderRespType'] = newOrderResp
      queryParams['timestamp'] = Date.now();

      const userData = await this.userService.getUserAccountKey(
        userId,
        platform,
      );
      const userSecretCredentals = lodash.find(userData[0]['exchange'], {
        exchangeName: platform,
      });
      // console.log("data in create order ",JSON.stringify(userSecretCredentals), JSON.stringify(userData[0]['exchange']))
      const apiKey = userSecretCredentals.apiKey;
      const secretKey = userSecretCredentals.secretKey;
      // queryParams['x-mbx-apiKey'] = apiKey
      queryParams['signature'] = Helper.generateExchangeSignature(
        queryParams,
        secretKey,
      );
      // const getQueryParams = Helper.generateExchangeSignature(queryParams, secretKey);
      // console.log("api key", apiKey, queryParams)

      const setHeaders = {
        'x-mbx-apiKey': apiKey,
        // 'Content-Type': 'application/json'
      };
      return await this.exchangeRepository.createNewOrder(
        platform,
        queryParams,
        setHeaders,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error occurred in service while creating new order on exchange ${platform} and queryParams ${createNewOrder} due to : ${error.message}`,
      );
    }
  }

  // **************** Transactions*****************
  async createNewUserTransaction(
    platform: string,
    userId: Types.ObjectId,
    newTransactionDto: TransactionDto,
  ) {
    const newTransaction: TransactionEntity = {
      userId: userId,
      platform: platform,
      // cryptocaseId: newTransactionDto.cryptocaseId,
      transactionType: newTransactionDto.transactionType,
      transactionFee: newTransactionDto.transactionFee,
      transactionTime: newTransactionDto.transactionTime,
      status: newTransactionDto.status,
      quoteSymbol: newTransactionDto.quoteSymbol,
      cummulativeBaseQtyBuy: newTransactionDto.cummulativeBaseQtyBuy,
      cummulativeQuoteQtySell: newTransactionDto.cummulativeQuoteQtySell,
      baseSymbol: newTransactionDto.baseSymbol,
      fills: newTransactionDto.fills,
    };

    return this.transactionRepository.createNewUserTransaction(newTransaction);
  }

  async getUserTransactionList(
    platform: string,
    userId: Types.ObjectId,
    options: PaginationParamsInterface,
  ): Promise<PaginatedTransactionInterface> {
    return await this.transactionRepository.getUserTransactionList(
      platform,
      userId,
      options,
    );
  }

  // *******************Portfolio subscription****************
  async subscribeExpertPortfolio(
    userId: Types.ObjectId,
    cryptocaseId: Types.ObjectId,
  ) {
    try {
      // Find user with userId
      const user: UsersEntity = await this.userService.getVerifiedUserById(
        userId,
      );
      if (!user) {
        throw new NotFoundException(
          `Unable to find verified user with id ${userId}`,
        );
      }
      // get platform api credentials
      const platformApiCredentials = lodash.find(user.exchange, {
        exchangeName: Platform.BINANCE,
      });
      if (lodash.isEmpty(platformApiCredentials)) {
        throw new NotFoundException(`Unable to find exchange platform name`);
      }
      // get cryptoexpertportfolio by case id
      const expertCryptocase: ExpertCryptocase =
        await this.expertCryptocase.findCryptocaseById(cryptocaseId);
      if (!expertCryptocase) {
        throw new NotFoundException(
          `Unable to find expertPortfolio with id ${cryptocaseId}`,
        );
      }
      // get qouteSymbol balance from platform/exchange
      const userPlatformAccountInfo: UserExchangeAccountInfo =
        await this.getUserAccountInfo(userId.toString(), Platform.BINANCE);
      // get free balance as current balance
      const balance: Balance = lodash.find(userPlatformAccountInfo.balances, {
        asset: expertCryptocase.quoteSymbol,
      });
      if (lodash.isEmpty(balance)) {
        throw new NotFoundException(
          `balance not found for respective quote symbol ${expertCryptocase.quoteSymbol}`,
        );
      }
      // get cryptoWeight weightagelist
      const cryptoWeights: CryptoWeight[] =
        expertCryptocase.cryptoWeightageList as CryptoWeight[];
      // get currency pair(SHIBUSDT) from cryptoWeight currencysymbol(SHIB) and portfolio quotesymbol(USDT)
      const portfolioTransactions = cryptoWeights.map(async (cryptoWeight) => {
        // calculate quantity by checking current price of SHIBUSDT by claculating Weight percentage of current balalnce and divide it with current price
        const coinsPair =
          await this.cryptoCoinsService.findCoinsPairByBaseSymbolAndQuoteSymbol(
            cryptoWeight.cryptoCoin.symbol,
            expertCryptocase.quoteSymbol,
          );
        this.logger.debug(
          `coins pair value ${JSON.stringify(coinsPair)} ${
            cryptoWeight.cryptoCoin.symbol
          } ${expertCryptocase.quoteSymbol}`,
        );
        const symbolCurrentPrice = (await this.getSymbolCurrentPrice(
          Platform.BINANCE,
          coinsPair.symbolPair,
        )) as CurrentPrice;
        const quantity: number = this.inprecise_round(
          ((balance.free - balance.free * 0.1) *
            cryptoWeight.currentPercentage) /
            (100 * symbolCurrentPrice.price),
          0,
        );
        this.logger.debug(
          `creating a new order with coinsPair ${coinsPair.symbolPair} current symbol price ${symbolCurrentPrice} with quantity ${quantity}`,
        );
        // place new order on platform api with above details
        const createNewOrderDto: CreateNewOrderDto = {
          side: TransactionType.BUY,
          symbol: coinsPair.symbolPair,
          type: 'MARKET',
          quantity: quantity,
          quoteOrderQty: quantity,
          newOrderResp: 'FULL',
        };
        const newExchangeOrder: NewOrderResponse = await this.createNewOrder(
          user._id.toString(),
          Platform.BINANCE,
          createNewOrderDto,
        );
        this.logger.debug(
          `successfully created new transaction order on exchange ${JSON.stringify(
            newExchangeOrder,
          )}`,
        );
        // create transaction object in db along with portfolio details
        const newExchangeTransaction: TransactionDto = {
          userId: user._id.toString(),
          transactionType: TransactionType.BUY,
          transactionFee: null,
          transactionTime: newExchangeOrder.transactTime,
          status: newExchangeOrder.transactionStatus,
          quoteSymbol: coinsPair.quoteSymbol,
          cummulativeBaseQtyBuy: newExchangeOrder.executedQty,
          cummulativeQuoteQtySell: newExchangeOrder.cummulativeQuoteQty,
          baseSymbol: coinsPair.cryptoCoin.symbol,
          fills: newExchangeOrder.fills,
          exchange: Platform.BINANCE,
          cryptocaseId: expertCryptocase._id.toString(),
        };
        return await this.createNewUserTransaction(
          Platform.BINANCE,
          user._id,
          newExchangeTransaction,
        );
      });

      return {
        error: false,
        message: 'Success fully subscribed the cryptocase',
        data: {
          cryptocaseId: cryptocaseId,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error occurred due to: ${error.message}`,
      );
    }
  }

  inprecise_round(value, decPlaces) {
    return (
      Math.round(value * Math.pow(10, decPlaces)) / Math.pow(10, decPlaces)
    );
  }

  async getHistoricalExchangeData(
    exchange: string,
    coinpair: string,
    after: Date,
    before: Date,
    periods: string,
  ) {
    try {
      const historicalExcangeData =
        await this.exchangeRepository.getHistoricalExchangeData(
          exchange,
          coinpair,
          after,
          before,
          periods,
        );
      if (!historicalExcangeData)
        throw new NotFoundException(
          `Unable to find the historical exchange data for exchange: ${exchange}, coinpair: ${coinpair}, after: ${after}, before: ${before}, periods: ${periods}`,
        );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
