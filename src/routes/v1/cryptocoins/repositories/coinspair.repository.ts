import { MongoException } from '@filters/mongo-exception.filter';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as lodash from 'lodash';
import { MyLogger } from '@shared/logger/logger.service';
import { Error, Model, Types } from 'mongoose';
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import {
  PaginatedCoinsPairInterface,
  PaginatedCryptocoinsInterface,
} from '@interfaces/paginated-users.interface';
import PaginationUtil from '@utils/pagination.util';
import { CoinsPair, CoinsPairDocument } from '../schemas/coinspair.schema';
import { CoinPair } from '../entities/coin-pair.entity';
import { UpdateCoinPairDto } from '../dto/update-coinpair.dto';
@Injectable()
export class CoinsPairRepository {
  constructor(
    @InjectModel(CoinsPair.name)
    private coinsPairModel: Model<CoinsPairDocument>,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CoinsPairRepository.name);
  }

  public async create(coinsPair: CoinsPair) {
    try {
      const newCoinsPair = await this.coinsPairModel.create({
        ...coinsPair,
      });

      this.logger.log(
        `Successfully created a new coins pair in db ${newCoinsPair}`,
      );
      return newCoinsPair.toObject();
    } catch (error) {
      this.logger.error(
        `Unexpected error while creating new coins Pair ${JSON.stringify(
          coinsPair,
        )} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }

  public async getById(id: Types.ObjectId): Promise<CoinsPair | null> {
    try {
      const coinsPair = await this.coinsPairModel.findById(id).lean();

      this.logger.log(
        `Successfully found coins Pair with id ${coinsPair._id} from db`,
      );
      return coinsPair;
    } catch (error) {
      this.logger.error(
        `Unexpected error while searching coins pair with id ${id} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }

  public async getBySymbol(symbolPair: string): Promise<CoinsPair | null> {
    try {
      const coinsPair = await this.coinsPairModel
        .findOne({
          symbolPair,
        })
        .lean();

      this.logger.log(
        `Successfully found crypto coin pair in db ${coinsPair.symbolPair}`,
      );
      return coinsPair;
    } catch (error) {
      this.logger.error(
        `Unexpected error while searching for cryptocoin ${symbolPair} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }

  public async getByQuery(query: UpdateCoinPairDto): Promise<CoinsPair | null> {
    try {
      let customQuery = {};
      if (query.baseSymbol) {
        // customQuery["cryptoApp.symbol"] = query.baseSymbol
        customQuery['cryptoCoin.symbol'] = query.baseSymbol;
      }

      if (query.symbolPair) {
        customQuery = {
          symbolPair: query.symbolPair,
        };
      }
      if (query.quoteSymbol) {
        customQuery = {
          quoteSymbol: query.quoteSymbol,
        };
      }
      this.logger.debug('query ', customQuery);

      if (lodash.isEmpty(customQuery)) {
        throw new NotAcceptableException(`Please try with valid query`);
      }
      const coinsPair: CoinPair = await this.coinsPairModel
        .findOne(customQuery)
        .lean();
      this.logger.log(
        `Successfully found crypto coin pair in db ${query.baseSymbol} and ${query.quoteSymbol}`,
      );
      return coinsPair;
    } catch (error) {
      this.logger.error(
        `Unexpected error while searching for coin pair ${query.baseSymbol} and ${query.quoteSymbol} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }

  public async getAllCoinsPairWithPagination(
    options: PaginationParamsInterface,
  ): Promise<PaginatedCoinsPairInterface> {
    try {
      const [coinPairs, totalCount] = await Promise.all([
        this.coinsPairModel
          .find()
          .limit(PaginationUtil.getLimitCount(options.limit))
          .skip(PaginationUtil.getSkipCount(options.page, options.limit))
          .lean(),
        this.coinsPairModel.count().lean(),
      ]);

      this.logger.log(
        `Successfully found the list of coinsPair from db ${totalCount}`,
      );
      return { paginatedResult: coinPairs, totalCount };
    } catch (error) {
      this.logger.error(
        `Unexpected error while listing crypto coin from db due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }
}
