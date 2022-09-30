import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Model } from "mongoose";
import { Wallet, WalletDocument } from "../schema/wallet.schema";
import { MongoError } from 'mongodb';

@Injectable()
export class WalletRepository{
    constructor(
        @InjectModel(Wallet.name) private walletModel : Model<WalletDocument>,
        private logger : MyLogger
    ){
        this.logger.setContext(WalletRepository.name);
    }

    public async create(wallet : Wallet) : Promise<Wallet> {
        try {
            const newWallet = await this.walletModel.create({
                ...wallet
            })
            this.logger.log(`Successfully created a new Wallet in db ${newWallet}`);
            return newWallet.toObject();
        }
        catch (error) {
            this.logger.error(`Unexpected error while creating new Wallet ${JSON.stringify(wallet)} due to ${error.message}`);
            throw new MongoError(error);
        }
        
    }

    // add or deduct crypto from wallet
    async transactionInWallet(wallet: Wallet){
        try {
            const newWallet = await this.walletModel.updateOne({
                ...wallet
            })
            this.logger.log(`Successfully created a new Wallet in db ${newWallet}`);
            return newWallet.modifiedCount;
        }
        catch (error) {
            this.logger.error(`Unexpected error while creating new Wallet ${JSON.stringify(wallet)} due to ${error.message}`);
            throw new MongoError(error);
        }
    }

    //
    async getWalletById(walletId: string) : Promise<Wallet>{
        try {
            const foundUser = await this.walletModel
            .findOne(
              {
                _id: walletId,
              }
            )
            .lean();
      
            this.logger.log(`Successfully found user by Id in db ${walletId}`);
            return foundUser
          } catch (error) {
            throw new ServiceUnavailableException(`Unexpected error while searching user with id ${walletId} due to ${error.message}`);
          }
    }
}
