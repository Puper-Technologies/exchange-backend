import { CRYPTO_DATA, ExchangeHistoryData } from '@config/constants';
import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MyLogger } from '@shared/logger/logger.service';
import { catchError, lastValueFrom, map } from 'rxjs';
import { CurrentPrice } from '../entities/current-price.entity';
import { HistoricalExchangeData } from '../entities/historical-data.entity';
import { NewOrderResponse } from '../entities/new-order-response.entity';
import { UserExchangeAccountInfo } from '../entities/user-exchange-account-info.entity';

@Injectable()
export default class ExchangeRepository {
  constructor(private logger: MyLogger, private httpAxiosClient: HttpService) {
    this.logger.setContext(ExchangeRepository.name);
  }

  async getExchangeInfo(platform: string, symbol?: string) {
    try {
      const assetTypes$ = await this.httpAxiosClient
        .get(
          CRYPTO_DATA[platform].BASE_URL +
            CRYPTO_DATA[platform].EXCHANGE_INFO +
            (symbol ? `?symbol=${symbol}` : ''),
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            // this.logger.error(`Error in get24hrTickerPriceChangeStatistics ${JSON.stringify(e.response.data.msg)} status code ${e.response.status}`)
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );
      return await lastValueFrom(assetTypes$);
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error in getExchangeInfo method while fetching exchange ${platform} info due to : ${error.message}`,
      );
    }
  }

  async get24hrTickerPriceChangeStatistics(
    platform: string,
    coinSymbol: string,
  ) {
    try {
      return this.httpAxiosClient
        .get(
          CRYPTO_DATA[platform].BASE_URL +
            CRYPTO_DATA[platform].SYMBOL_24HR_PRICE_STATS +
            `?symbol=${coinSymbol}`,
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            // this.logger.error(`Error in get24hrTickerPriceChangeStatistics ${JSON.stringify(e.response.data.msg)} status code ${e.response.status}`)
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error in get24hrTickerPriceChangeStatistics method while fetching ticker price on exchange ${platform} and symbol ${coinSymbol} due to : ${error.message}`,
      );
    }
  }

  async getUserAccountInfo(
    platform: string,
    getQueryParams: any,
    headers: any,
  ): Promise<UserExchangeAccountInfo> {
    try {
      const assetTypes$ = this.httpAxiosClient
        .get(
          CRYPTO_DATA[platform].BASE_URL +
            CRYPTO_DATA[platform].ACCOUNT_INFO +
            getQueryParams,
          { headers: headers },
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            // this.logger.error(`Error in get24hrTickerPriceChangeStatistics ${JSON.stringify(e.response.data.msg)} status code ${e.response.status}`)
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );
      return await lastValueFrom(assetTypes$);
      // return new Promise((resolve, reject) => {
      //   this.httpAxiosClient
      //     .get(
      //       CRYPTO_DATA[platform].BASE_URL +
      //       CRYPTO_DATA[platform].ACCOUNT_INFO +
      //       getQueryParams,
      //       { headers: headers },
      //     ).subscribe((response: any) => {
      //       resolve(response);
      //     }, reject);
      // });
      // return await this.httpAxiosClient
      //   .get(
      //     CRYPTO_DATA[platform].BASE_URL +
      //     CRYPTO_DATA[platform].ACCOUNT_INFO +
      //     getQueryParams,
      //     { headers: headers },
      //   )
      //   .pipe(map((x) => x.data),
      //     catchError(e => {
      //       // this.logger.error(`Error in get24hrTickerPriceChangeStatistics ${JSON.stringify(e.response.data.msg)} status code ${e.response.status}`)
      //       throw new InternalServerErrorException(e.response.data.msg, e.response.status);
      //     }))
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error in getUserAccountInfo method while fetching user account info on exchange ${platform} and params ${getQueryParams} due to : ${error.message}`,
      );
    }
  }

  async getSymbolCurrentPrice(
    platform: string,
    symbol?: string,
  ): Promise<CurrentPrice | CurrentPrice[]> {
    try {
      const assetTypes$ = this.httpAxiosClient
        .get(
          CRYPTO_DATA[platform].BASE_URL +
            CRYPTO_DATA[platform].SYMBOL_CURRENT_PRICE +
            (symbol ? `?symbol=${symbol}` : ''),
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            // this.logger.error(`Error in get24hrTickerPriceChangeStatistics ${JSON.stringify(e.response.data.msg)} status code ${e.response.status}`)
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );
      return await lastValueFrom(assetTypes$);
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error occurred in getSymbolCurrentPrice method while fetching symbol price on exchange ${platform} and symbol ${symbol} due to : ${error.message}`,
      );
    }
  }

  async createNewOrder(
    platform: string,
    queryParams: any,
    headers: any,
  ): Promise<NewOrderResponse> {
    try {
      const requestConfig = {
        headers: headers,
        params: queryParams,
      };
      const assetTypes$ = this.httpAxiosClient
        .post(
          CRYPTO_DATA[platform].BASE_URL + CRYPTO_DATA[platform].NEW_ORDER,
          null,
          requestConfig,
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            this.logger.debug(
              'Creating new order',
              CRYPTO_DATA[platform].BASE_URL +
                CRYPTO_DATA[platform].NEW_ORDER +
                JSON.stringify(requestConfig),
            );
            // this.logger.error(`Error in createNewOrder ${JSON.stringify(e.message)} status code ${e.stack}`)
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );
      return await lastValueFrom(assetTypes$);
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error occurred in createNewOrder method while creating new order on exchange ${platform} and queryParams ${queryParams} due to : ${error.message}`,
      );
    }
  }

  async getHistoricalExchangeData(
    exchange: string,
    coinpair: string,
    after: Date,
    before: Date,
    periods: string,
  ): Promise<HistoricalExchangeData[] | null> {
    try {
      console.log(periods);
      const assetTypes$ = this.httpAxiosClient
        .get(
          ExchangeHistoryData.BASE_URL +
            `/markets/${exchange}/${coinpair}/ohlc?after=${
              after.getTime() / 1000
            }&before=${before.getTime() / 1000}&periods=${
              ExchangeHistoryData.periods[periods]
            }`,
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );
      const responseResult = await lastValueFrom(assetTypes$);
      return responseResult.result[ExchangeHistoryData.periods[periods]];
    } catch (error) {
      throw new InternalServerErrorException(`Unexpected error occured on fetching exchange history`);
    }    
  }
}
