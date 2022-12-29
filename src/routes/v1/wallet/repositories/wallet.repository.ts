import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Model, Types } from "mongoose";
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
            });
            this.logger.log(`Successfully created a new Wallet in db ${newWallet}`);
            return newWallet.toObject();
        }
        catch (error) {
            this.logger.error(`Unexpected error while creating new Wallet ${JSON.stringify(wallet)} due to ${error.message}`);
            throw new MongoError(error);
        }
        
    }

}