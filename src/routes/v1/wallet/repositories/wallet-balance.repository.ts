import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";
import { WalletBalance, WalletBalanceDocument } from "../schema/wallet-balance.schema";
import { MongoError } from 'mongodb';
import { Injectable } from "@nestjs/common";
@Injectable()
export class WalletBalanceRepository {
    constructor(
        @InjectModel(WalletBalance.name) private readonly walletBalanceModel: Model<WalletBalanceDocument>
    ){}

    async updateWalletBalance(walletId: Types.ObjectId, coinId: Types.ObjectId, amount: number, session?: ClientSession){
        try {
            return await this.walletBalanceModel.findOneAndUpdate({
                walletId,
                coinId
            }, 
            { 
               $inc: {
                    balance: amount
               }
            }, 
            { upsert: true, new: true, rawResult: true }
            )
            .session(session)
            .lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }
}