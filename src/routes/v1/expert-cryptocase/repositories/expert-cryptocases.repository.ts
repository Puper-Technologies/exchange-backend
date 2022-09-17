import { MongoException } from "@filters/mongo-exception.filter";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Error, Model, Types } from "mongoose";
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from "@interfaces/pagination-params.interface";
import { PaginatedCryptocoinsInterface, PaginatedExpertCryptocaseInterface } from "@interfaces/paginated-users.interface";
import PaginationUtil from '@utils/pagination.util';
import { ExpertCryptocase, ExpertCryptocaseDocument } from "../schemas/expert-cryptocase.schema";
import { UpdateCryptoWeightDto } from "../dto/update-crypto-weight.dto";
import { Cryptocoin } from "@v1/cryptocoins/entities/cryptocoin.entity";
import { CryptoWeight } from "../entities/crypto-weight.entity";
import { UpdateExpertCryptocaseDto } from "../dto/update-expert-cryptocase.dto";
import { AddCryptoWeightDto } from "../dto/add-crypto-weight.dto";
import { DomainType, VolatilityType } from "@config/constants";
// 
@Injectable()
export class ExpertCryptocaseRepository {
    constructor( @InjectModel(ExpertCryptocase.name) private expertCryptocaseModel: Model<ExpertCryptocaseDocument>, private logger: MyLogger ) {
        this.logger.setContext(ExpertCryptocaseRepository.name);
    }
    public async create(expertCryptocase: ExpertCryptocase) {
        try {
            // console.log("expectcryptocase   ",expertCryptocase )
            const newExpertCryptoCryptocase = await this.expertCryptocaseModel.create({
                ...expertCryptocase,
            })
            
            return await this.expertCryptocaseModel.findById(newExpertCryptoCryptocase._id).populate('cryptoWeightageList');

            // this.logger.log(`Successfully created a new crypto Cryptocase by expert ${newExpertCryptoCryptocase.expertId} in db`);
            // return newExpertCryptoCryptocase.toObject();

        } catch (error) {
            this.logger.error(`Unexpected error while creating new Cryptocase ${JSON.stringify(expertCryptocase)} due to ${error.message}`);
            throw new MongoError(error);
        }
    }

    public async getById(id: Types.ObjectId): Promise<ExpertCryptocase | null> {
        try {
            
            const expertCryptoCryptocase = await this.expertCryptocaseModel
                .findById(id)
                .populate('cryptoWeightageList')
                .lean();
            this.logger.log(`Successfully found crypto Cryptocase with id ${expertCryptoCryptocase._id} from db`);
            return expertCryptoCryptocase
        } catch (error) {
            this.logger.error(`Unexpected error while searching crypto Cryptocase with id ${id} due to ${error.message}`)
            throw new MongoError(error);
        }
    }

    public async getCryptocaseByExpertId(id: string, options: PaginationParamsInterface) : Promise<PaginatedExpertCryptocaseInterface> {
        try {
            const [cryptocoin, totalCount] = await Promise.all([
                this.expertCryptocaseModel.find({ expertId: new Types.ObjectId(id)})
                    .populate('cryptoWeightageList')
                    .limit(PaginationUtil.getLimitCount(options.limit))
                    .skip(PaginationUtil.getSkipCount(options.page, options.limit))
                    .lean(),
                this.expertCryptocaseModel.find({ expertId: new Types.ObjectId(id) }).count()
                    .lean(),
            ]);

            this.logger.log(`Successfully found the list of crypto Cryptocase from db ${totalCount}`)
            return { paginatedResult: cryptocoin, totalCount };

        } catch (error) {
            this.logger.error(`Unexpected error while listing crypto Cryptocase from db due to ${error.message}`)
            throw new MongoError(error);
        }
    }

    public async getAllCryptoCryptocases(options: PaginationParamsInterface) : Promise<PaginatedExpertCryptocaseInterface> {
        try {
            const [cryptocoin, totalCount] = await Promise.all([
                this.expertCryptocaseModel.find()
                    .populate('cryptoWeightageList')
                    .sort([['createdAt', -1]])
                    .limit(PaginationUtil.getLimitCount(options.limit))
                    .skip(PaginationUtil.getSkipCount(options.page, options.limit))
                    .lean(),
                this.expertCryptocaseModel.count()
                    .lean(),
            ]);

            this.logger.log(`Successfully found the list of crypto Cryptocase from db ${totalCount}`)
            return { paginatedResult: cryptocoin, totalCount };

        } catch (error) {
            this.logger.error(`Unexpected error while listing crypto Cryptocase from db due to ${error.message}`)
            throw new MongoError(error);
        }
    }

    public async updateCryptoWeightInCryptocaseById(id: Types.ObjectId, data: Types.ObjectId[]): Promise<ExpertCryptocase | null> {
        try {
            // this.logger.log(`found the data ${id} with data${JSON.stringify(data)}`)
          const updatedUser =  await this.expertCryptocaseModel
            .findOneAndUpdate({
              "_id": id
            },
              {
                cryptoWeightageList: data
              },
              { upsert: true, new: true }
            )
            .populate('cryptoWeightageList')
            .lean();
    
            // this.logger.debug(`Successfully updated the Cryptocase ${id} with data ${JSON.stringify(updatedUser)}`)
            this.logger.log(`Successfully updated the Cryptocase ${id}`)
            return updatedUser
        } catch (error) {
        this.logger.error(`Unexpected error occured in updating Cryptocase due to ${error.message}`)
          throw new MongoError(error);
        }
      }

      public async updateCryptocaseById(id: Types.ObjectId, data: UpdateExpertCryptocaseDto): Promise<ExpertCryptocase | null> {
        try {
            // this.logger.log(`found the data ${id} with data${JSON.stringify(data)}`)
            
          const updatedCryptoCaseById =  await this.expertCryptocaseModel
            .findOneAndUpdate({
              "_id": id
            },
              data,
              { upsert: true, new: true }
            )
            .populate('cryptoWeightageList')
            .lean();
    
            this.logger.log(`Successfully updated data in the Cryptocase ${id} with data`)
            return updatedCryptoCaseById
        } catch (error) {
        this.logger.error(`Unexpected error occured in updating data in the Cryptocase due to ${error.message}`)
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

    public async getAllCryptocoinsWithPagination(options: PaginationParamsInterface): Promise<PaginatedExpertCryptocaseInterface> {
        try {

            const [expertCryptoCryptocase, totalCount] = await Promise.all([
                this.expertCryptocaseModel.find()
                    .populate('cryptoWeightageList')
                    .sort({ createdAt: -1 })
                    .limit(PaginationUtil.getLimitCount(options.limit))
                    .skip(PaginationUtil.getSkipCount(options.page, options.limit))  //
                    .lean(),
                this.expertCryptocaseModel.count()
                    .lean(),
            ]);

            this.logger.log(`Successfully found the list of expertCryptoCryptocases from db ${totalCount}`)
            return { paginatedResult: expertCryptoCryptocase, totalCount };

        } catch (error) {
            this.logger.error(`Unexpected error while listing crypto coin from db due to ${error.message}`)
            throw new MongoError(error);
        }
    }



    public async aggregateTest(symbol?:string,limit?: number,skip?:number){
        return await this.expertCryptocaseModel.aggregate([
            {
                $lookup:{
                    from:'cryptoweights',
                    localField:'_id',
                    foreignField:'cryptocaseId',
                    as:'cryptoweights'
                }
            },
            {
                $match : {
                //    'cryptoweights.cryptoCoin.symbol':'SHIB'
                        cryptoweights: {
                            $elemMatch:{
                                'cryptoCoin.symbol':`${symbol}`
                        }
                    }
                }
            },

        ])
    }


    public async getCryptocasesByQuery(filterQuery: any,sortQuery: any, options?: PaginationParamsInterface): Promise<PaginatedExpertCryptocaseInterface>  {
        try {
            const [ cryptocases, count ] = await Promise.all([
                this.expertCryptocaseModel.aggregate([
                   {
                       $lookup: {
                           from:'cryptoweights',
                           localField:'_id',
                           foreignField:'cryptocaseId',
                           as:'cryptoWeightageList'
                       }
                   },
                   {
                       $match : filterQuery
                   },
                    {
                        $project: {
                            _id: 1,
                            expertId:1,
                            name:1,
                            domain:1,
                            volatility:1,
                            description:1,
                            tags:1,
                            exchange:1,
                            quoteSymbol:1,
                            pricing:1,
                            cryptoWeightageList:1,
                            createdAt:1,
                            weightingScheme:1,
                            caseType:1,
                            noOfCoins: { $cond: { if: { $isArray: "$cryptoWeightageList" }, then: { $size: "$cryptoWeightageList" }, else: 0} }
                        }
                    },
                   {
                       $sort:sortQuery
                   },
                   {
                       $skip:PaginationUtil.getSkipCount(options.page,options.limit)
                   },
                   {
                       $limit:PaginationUtil.getLimitCount(options.limit)
                   }
               ]),
              this.expertCryptocaseModel.aggregate([
               {
                   $lookup:{
                       from:'cryptoweights',
                       localField:'_id',
                       foreignField:'cryptocaseId',
                       as:'cryptoWeightageList'
                   }
               },
               {
                   $match : filterQuery
               },
               {
                   $count:"totalCount"
               }
              ])
           ])
           return { paginatedResult: cryptocases, totalCount:count.length?count[0].totalCount:0 }
        } catch (error) {
            this.logger.error(`Unexpected error while listing crypto cases from db due to ${error.message}`);
            throw new MongoError(error);
        }
        
    }
}