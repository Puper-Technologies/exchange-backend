import { MongoException } from "@filters/mongo-exception.filter";
import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Error, Model, Types } from "mongoose";
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from "@interfaces/pagination-params.interface";
import { PaginatedCryptocoinsInterface, PaginatedCryptoWeightInterface } from "@interfaces/paginated-users.interface";
import PaginationUtil from '@utils/pagination.util';
import { CryptoWeight, CryptoWeightDocument } from "../schemas/crypto-weight.schema";

@Injectable()
export class CryptoWeightRepository {
    constructor(
        @InjectModel(CryptoWeight.name) private cryptoWeightModel: Model<CryptoWeightDocument>,
        private logger: MyLogger
    ) {
        this.logger.setContext(CryptoWeightRepository.name);
    }

    public async create(cryptoWeight: CryptoWeight) : Promise<CryptoWeight | null> {
        try {
            const newCryptoWeight = await this.cryptoWeightModel.create({
                ...cryptoWeight,
            });

            this.logger.log(`Successfully created a new crypto Weight by expert ${newCryptoWeight.id} in db`);
            return newCryptoWeight.toObject();

        } catch (error) {
            this.logger.error(`Unexpected error while creating new crytpo Weight ${JSON.stringify(cryptoWeight)} due to ${error.message}`);
            throw new MongoError(error);
        }
    }

    public async getById(id: Types.ObjectId): Promise<CryptoWeight | null> {
        try {
            const cryptoWeight = await this.cryptoWeightModel
                .findById(id)
                .lean();
            this.logger.log(`Successfully found cryptocoin with id ${cryptoWeight._id} from db`);
            return cryptoWeight
        } catch (error) {
            this.logger.error(`Unexpected error while searching crypto coin with id ${id} due to ${error.message}`)
            throw new MongoError(error);
        }
    }

    // public async getBySymbol(symbol: string): Promise<Cryptocoin | null> {
    //     try {
    //         const cryptocoin = await this.cryptocoinModel
    //             .findOne({
    //                 symbol,
    //             })
    //             .lean();

    //         this.logger.log(`Successfully found cryptocoin in db ${cryptocoin.name}`);
    //         return cryptocoin
    //     } catch (error) {
    //         this.logger.error(`Unexpected error while searching for cryptocoin ${symbol} due to ${error.message}`)
    //         throw new MongoError(error);
    //     }
    // }

    public async updateCryptoWeightById(id: Types.ObjectId, data: Partial<CryptoWeight>): Promise<CryptoWeight | null> {
        try {
            // this.logger.log(`found the data ${id} with data${JSON.stringify(data)}`)
          const updatedCryptoWeight=  await this.cryptoWeightModel
            .findOneAndUpdate({
              "_id": id
            },
              data
              ,
              { upsert: true, new: true }
            ).lean();
    
            this.logger.log(`Successfully updated the cryptoWeight ${id} with data ${JSON.stringify(updatedCryptoWeight)}`)
            return updatedCryptoWeight
        } catch (error) {
        this.logger.error(`Unexpected error occured in updating cryptostate due to ${error.message}`)
          throw new MongoError(error);
        }
      }

    public async getAllCryptoWeightWithPagination(options: PaginationParamsInterface): Promise<PaginatedCryptoWeightInterface> {
        try {

            const [cryptoWeight, totalCount] = await Promise.all([
                this.cryptoWeightModel.find()
                    .limit(PaginationUtil.getLimitCount(options.limit))
                    .skip(PaginationUtil.getSkipCount(options.page, options.limit))
                    .lean(),
                this.cryptoWeightModel.count()
                    .lean(),
            ]);

            this.logger.log(`Successfully found the list of cryptoWeights from db ${totalCount}`)
            return { paginatedResult: cryptoWeight, totalCount };

        } catch (error) {
            this.logger.error(`Unexpected error while listing crypto coin from db due to ${error.message}`)
            throw new MongoError(error);
        }
    }


    public async getAllCryptoWeightsWithCaseId(caseId: Types.ObjectId): Promise<CryptoWeight[] | null> {
        try{ 
            const cryptoWeights: CryptoWeight[] = await this.cryptoWeightModel
            .find({ portfolioId:caseId })
            .lean();
            this.logger.log(`Successfully found the list of cryptoWeights of case ${caseId}`)
            return cryptoWeights;
        }catch(error){
            throw new MongoError(error);
        }
    }
}