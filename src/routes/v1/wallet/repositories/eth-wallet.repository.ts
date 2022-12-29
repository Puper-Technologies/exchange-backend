import { MongoException } from "@filters/mongo-exception.filter";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Types, Model } from "mongoose";
import { EthereumWallet, EthereumWalletDocument } from "../schema/eth-wallet.schema";

@Injectable()
export class EthereuemWalletRepository {
    constructor(
        @InjectModel(EthereumWallet.name) private readonly ethereuemWalletModel: Model<EthereumWalletDocument>,
        private readonly logger : MyLogger
        ){
    }

    async createEthereumWallet(walletId: Types.ObjectId, ethWallet){
        try {
            return await this.ethereuemWalletModel.create({
                walletId,
                ...ethWallet
            })
        } catch (error) {
            this.logger.log(`unexpected error occured while creating etheruem wallet for data ${walletId}`);
            throw new MongoException(error.message, error);
        }
    }

    async getEthWalletByWalletId(walletId: Types.ObjectId){
        try {
            return await this.ethereuemWalletModel.findOne({
                walletId
            }).lean();
        } catch (error) {
            this.logger.log(`unexpected error occured while fetching etheruem wallet for walletId ${walletId}`);
            throw new MongoException(error.message, error);
        }
    }

    
}