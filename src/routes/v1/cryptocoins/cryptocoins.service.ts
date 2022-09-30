import { PaginatedCryptocoinsInterface } from '@interfaces/paginated-users.interface';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { MyLogger } from '@shared/logger/logger.service';
import { Types } from 'mongoose';
import { CryptocoinRepository } from './repositories/cryptocoins.repository';
import { CreateCryptocoinPairDto } from './dto/create-cryptocoin-pair.dto';
import { CoinsPairRepository } from './repositories/coinspair.repository';
import * as lodash from 'lodash';
import { CoinPair } from './entities/coin-pair.entity';
import { Cryptocoin } from './entities/cryptocoin.entity';
import { CRYPTO_DATA, Platform } from '@config/constants';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CryptocoinsService {
  constructor(
    private readonly cryptocoinRepository: CryptocoinRepository,
    private readonly coinsPairRepository: CoinsPairRepository,
    private logger: MyLogger,
    private httpAxiosClient: HttpService,
  ) {
    this.logger.setContext(CryptocoinsService.name);
  }

  async addCryptoCurrency(
    createCryptocoinDto: Partial<Cryptocoin>,
  ): Promise<Cryptocoin> {
    return this.cryptocoinRepository.create(createCryptocoinDto);
  }

  // This method is for temporarily adding the cryptocoins to app
  // Need enhancement for production level
  async addExchangeCryptoCurrencies(
    cryptoExchange: string,
    quoteSymbol: string,
    cmcApiKey: string,
  ) {
    try {
      // Api to fetch all coin details from respective exchange
      const cryptoAssetList$ = await this.httpAxiosClient
        .get(
          CRYPTO_DATA[cryptoExchange].BASE_URL +
            CRYPTO_DATA[cryptoExchange].EXCHANGE_INFO,
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            this.logger.error(
              `Error in accessing ${cryptoExchange} exchange supported coin info ${JSON.stringify(
                e.response.data.msg,
              )} status code ${e.response.status}`,
            );
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );

      // Api for fetching coin basic details from CoinMarketCap website
      const cryptoAssetCMCDetails$ = await this.httpAxiosClient
        .get(
          'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?' +
            'start=1&limit=1000&sortBy=market_cap&sortType=desc&convert=USDT,BNB,BUSD' +
            '&cryptoType=all&tagType=all&audited=false&aux=ath,atl,high24h,low24h,num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,volume_7d,volume_30d,self_reported_circulating_supply,self_reported_market_cap',
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            this.logger.debug(
              `Error in accessing CMC api ${JSON.stringify(
                e.response.data.msg,
              )} status code ${e.response.status}`,
            );
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );

      const exchangeSupportedCryptoList = await lastValueFrom(cryptoAssetList$);
      const cmcCryptoCurrenciesData = await lastValueFrom(
        cryptoAssetCMCDetails$,
      );
      const supportingCoinsId = [];
      const supportedQuoteCurrencies = lodash.filter(
        exchangeSupportedCryptoList.symbols,
        { quoteAsset: quoteSymbol },
      );

      // Need to uncomment when multiple quote symbol is supported
      // const filtered = lodash.filter(exchangeSupportedCryptoList.symbols, (symbol) => {
      //   return symbol.quoteAsset === "USDT" || symbol.quoteAsset === "BUSD";
      // });

      this.logger.debug(
        `Length of supported found crypto currencies on ${cryptoExchange}`,
        cmcCryptoCurrenciesData.data.cryptoCurrencyList.length,
      );

      const currenciesMetaInfo = supportedQuoteCurrencies
        .map((coin) => {
          let cmcCoin: any =
            lodash.find(cmcCryptoCurrenciesData.data.cryptoCurrencyList, {
              symbol: coin.baseAsset,
            }) || null;
          if (!lodash.isNull(cmcCoin) && cmcCoin.id != undefined) {
            const cryptoCoin = {
              name: cmcCoin.name,
              symbol: coin.baseAsset,
              slug: cmcCoin.slug,
              description: '',
              marketCap: [],
              isActive: 1,
              cmcId: cmcCoin.id,
              logo: '',
              cmcRank: cmcCoin.cmcRank,
              circulatingSupply: cmcCoin.circulatingSupply,
              totalSupply: cmcCoin.totalSupply,
              tags: [],
              dateLaunched: null,
              category: null,
              website: null,
            };
            supportingCoinsId.push(cmcCoin.id);
            return cryptoCoin;
          }
        })
        .filter((n) => n);

      const cmcAssetInfo$ = await this.httpAxiosClient
        .get(
          `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${supportingCoinsId.toString()}`,
          {
            headers: {
              'X-CMC_PRO_API_KEY': cmcApiKey
                ? cmcApiKey
                : '458f48ee-d81e-4d2a-8484-02306834ecb1',
            },
          },
        )
        .pipe(
          map((x) => x.data),
          catchError((e) => {
            this.logger.error(
              `Error Occured while accessing CMC api ${JSON.stringify(
                e.response.data.msg,
              )} status code ${e.response.status}`,
            );
            throw new InternalServerErrorException(
              e.response.data.msg,
              e.response.status,
            );
          }),
        );

      const cmc_coin_data = await lastValueFrom(cmcAssetInfo$);

      const coinDetails = currenciesMetaInfo.map((coin) => {
        // console.log("cmc data ",coin.name, cmc_coin_data.data[coin.cmcId].logo)
        if (!lodash.isNull(coin)) {
          coin.logo = cmc_coin_data.data[coin.cmcId].logo;
          coin.description = cmc_coin_data.data[coin.cmcId].description;
          coin.dateLaunched = cmc_coin_data.data[coin.cmcId].date_launched;
          coin.category = cmc_coin_data.data[coin.cmcId].category;
          coin.tags = cmc_coin_data.data[coin.cmcId].tags;
          coin.website = cmc_coin_data.data[coin.cmcId].urls.website;
          return coin;
        }
      });

      // Try to dump data into file
      // const logo = await fs.writeFile('coinDetailsBUSD.json', JSON.stringify(coinDetails), (err) => {
      //   if (err) {
      //     console.log("error", err)
      //   }
      // });

      // for await (const coinObject of coinDetails.map(coin => this.cryptocoinRepository.addExchangeCurrencies(coin))) {
      //   this.logger.log(`Success fully added coin `, coinObject.name)
      // }

      const addedCoins = [];
      for (const coin of coinDetails) {
        addedCoins.push(
          await this.cryptocoinRepository.addExchangeCurrencies(coin),
        );
      }
      this.logger.debug(`Success fully added data:`, addedCoins.length);
      // const exchangeCurrencies = ;
      return addedCoins.length;
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected error in getExchangeInfo method while fetching exchange ${Platform} info due to : ${error.message}`,
      );
    }
  }

  async findAllCryptoCoins(
    quoteSymbol: string,
    search: string,
    options: PaginationParamsInterface,
  ): Promise<PaginatedCryptocoinsInterface> {
    const query = {}
    // Query for searching cryptocoins by name or symbol
    if (search)
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
      ];

    try {
      const coinsList = await this.cryptocoinRepository.getAllCryptocoinsWithPagination(query, options);
      const results: Cryptocoin[] = await Promise.all(coinsList.paginatedResult.map(async (cryptoCoin): Promise<Cryptocoin> => {
        // Need to enhance and take the price fetching method from exchange service
        let currentPrice = await this.getCurrentPriceOfCoin("binance", cryptoCoin.symbol.toUpperCase(), quoteSymbol.toUpperCase());
        cryptoCoin.price = currentPrice;
        cryptoCoin.quoteSymbol = quoteSymbol;
        return cryptoCoin
      }));
      );

      console.log(
        'coin list',
        quoteSymbol,
        coinsList.paginatedResult[0],
        results[0],
      );
      return coinsList;
    } catch (error) {
      throw new NotAcceptableException(
        `Error occurred in cryptocoins service ${error.message}`,
      );
    }
  }
  async getCurrentPriceOfCoin(
    cryptoExchange: string,
    baseSymbol: string,
    quoteSymbol: string,
  ) {
    const assetTypes$ = this.httpAxiosClient
      .get(
        CRYPTO_DATA[cryptoExchange].BASE_URL +
          CRYPTO_DATA[cryptoExchange].SYMBOL_CURRENT_PRICE +
          `?symbol=${baseSymbol + quoteSymbol}`,
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
    const currentPrice = await lastValueFrom(assetTypes$);
    console.log('cureent price ', currentPrice);
    return currentPrice;
  }

  async findCryptoCoinById(id: Types.ObjectId): Promise<Cryptocoin> {
    return await this.cryptocoinRepository.getById(id);
  }

  async findAllCryptoCoinByIds(cryptoCoins: string[]): Promise<Cryptocoin[]> {
    return await this.cryptocoinRepository.getByIds(cryptoCoins);
  }

  async findCryptoCoinsBySymbol(symbol: string): Promise<Cryptocoin> {
    return await this.cryptocoinRepository.getBySymbol(symbol);
  }

  async addCoinsPair(createCryptocoinPairDto: CreateCryptocoinPairDto) {
    try {
      const cryptoCoin =
        (await this.cryptocoinRepository.getBySymbol(
          createCryptocoinPairDto.baseSymbol,
        )) || null;
      this.logger.debug(
        `Crypto coin details in service ${JSON.stringify(cryptoCoin)}`,
      );
      if (lodash.isEmpty(cryptoCoin)) {
        throw new NotFoundException(
          `Not found crypto coin with symbol ${createCryptocoinPairDto.baseSymbol}`,
        );
      }
      const coinPairObject: CoinPair = {
        cryptoCoin: cryptoCoin,
        quoteSymbol: createCryptocoinPairDto.quoteSymbol,
        symbolPair: createCryptocoinPairDto.symbolPair,
      };

      return await this.coinsPairRepository.create(coinPairObject);
    } catch (error) {
      // this.logger.error(`Error occurred in cryptocoins service ${error.message}`)
      throw new NotAcceptableException(
        `Error occurred in cryptocoins service ${error.message}`,
      );
    }
  }

  async findCoinsPairListByQuoteSymbol(quoteSymbol: string) {
    return await this.coinsPairRepository.getByQuery({ quoteSymbol });
  }

  async findCoinsPairByBaseSymbol(baseSymbol: string) {
    return await this.coinsPairRepository.getByQuery({ baseSymbol });
  }

  async findCoinsPairByBaseSymbolAndQuoteSymbol(
    basesymbol: string,
    quotesymbol,
  ) {
    const query = {
      baseSymbol: basesymbol,
      quoteSymbol: quotesymbol,
    };
    return await this.coinsPairRepository.getByQuery(query);
  }
}
