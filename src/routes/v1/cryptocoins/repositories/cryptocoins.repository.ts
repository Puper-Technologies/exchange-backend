import { MongoException } from "@filters/mongo-exception.filter";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Error, Model, Types } from "mongoose";
import { CryptocoinDocument, Cryptocoin } from "../schemas/cryptocoin.schema";
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from "@interfaces/pagination-params.interface";
import { PaginatedCryptocoinsInterface } from "@interfaces/paginated-users.interface";
import PaginationUtil from '@utils/pagination.util';
@Injectable()
export class CryptocoinRepository {
    constructor(
        @InjectModel(Cryptocoin.name) private cryptocoinModel: Model<CryptocoinDocument>,
        private logger: MyLogger
    ) {
        this.logger.setContext(CryptocoinRepository.name);
    }

    public async create(cryptocoin: Partial<Cryptocoin>): Promise<Cryptocoin> {
        try {
            const newCryptocoin = await this.cryptocoinModel.create({
                ...cryptocoin,
            });

            this.logger.log(`Successfully created a new Cryptocoin in db ${newCryptocoin}`);
            return newCryptocoin.toObject();

        } catch (error) {
            this.logger.error(`Unexpected error while creating new Cryptocoin ${JSON.stringify(cryptocoin)} due to ${error.message}`);
            throw new MongoError(error);
        }
    }

    public async addExchangeCurrencies(cryptocoin: Partial<Cryptocoin>): Promise<Cryptocoin> {
        try {
            const newCryptocoin = await this.cryptocoinModel.create({
                ...cryptocoin,
            });

            this.logger.log(`Successfully created a new Cryptocoin in db ${newCryptocoin._id}`);
            return newCryptocoin.toObject();

        } catch (error) {
            this.logger.error(`Unexpected error while creating new Cryptocoin ${JSON.stringify(cryptocoin)} due to ${error.message}`);
            throw new MongoError(error);
        }
    }

    public async getById(id: Types.ObjectId): Promise<Cryptocoin | null> {
        try {
            const cryptocoin = await this.cryptocoinModel
                .findById(id)
                .lean();

            this.logger.log(`Successfully found cryptocoin with id ${cryptocoin._id} from db`);
            return cryptocoin
        } catch (error) {
            this.logger.error(`Unexpected error while searching crypto coin with id ${id} due to ${error.message}`)
            throw new MongoError(error);
        }
    }

    public async getByIds(ids: string []): Promise<Cryptocoin [] | null> {
        try {
            const cryptocoin = await this.cryptocoinModel
                .find({
                    '_id': { $in: ids }
                })
                .lean();

            this.logger.log(`Successfully found multiple cryptocoins with ids ${cryptocoin.length} from db`);
            return cryptocoin
        } catch (error) {
            this.logger.error(`Unexpected error while searching crypto coin with id ${ids} due to ${error.message}`)
            throw new MongoError(error);
        }
    }

    public async getBySymbol(symbol: string): Promise<Cryptocoin | null> {
        try {
            const cryptocoin = await this.cryptocoinModel
                .findOne({
                    symbol,
                })
                .lean();

            this.logger.log(`Successfully found cryptocoin in db ${cryptocoin.name}`);
            return cryptocoin
        } catch (error) {
            this.logger.error(`Unexpected error while searching for cryptocoin ${symbol} due to ${error.message}`)
            throw new MongoError(error);
        }
    }

    public async getAllCryptocoinsWithPagination(query: any,options: PaginationParamsInterface): Promise<PaginatedCryptocoinsInterface> {
        try {
            console.log(query)
            const [cryptocoin, totalCount] = await Promise.all([
                this.cryptocoinModel.find(query)
                    .sort({ cmcRank : 1 })
                    .skip(PaginationUtil.getSkipCount(options.page, options.limit))
                    .limit(PaginationUtil.getLimitCount(options.limit))
                    .lean(),
                this.cryptocoinModel.count()
                    .lean(),
            ]);

            this.logger.log(`Successfully found the list of cryptocoins from db ${totalCount}`)
            return { paginatedResult: cryptocoin, totalCount };

        } catch (error) {
            this.logger.error(`Unexpected error while listing crypto coin from db due to ${error.message}`)
            throw new MongoError(error);
        }
    }
}