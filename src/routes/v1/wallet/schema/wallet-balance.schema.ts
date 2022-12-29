import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { CoinPair } from "@v1/cryptocoins/entities/coin-pair.entity";
import { Cryptocoin } from "@v1/cryptocoins/schemas/cryptocoin.schema";
import {Types} from 'mongoose';
@Schema({  timestamps: true })
export class WalletBalance {

    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
    })
    walletId: Types.ObjectId;
    
    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: Cryptocoin.name
    })
    coinId: Types.ObjectId;

    @Prop({
        type: Number,
        default: 0,
        MIN_VALUE: 0
    })
    balance: number;

}

export type WalletBalanceDocument = WalletBalance & Document;

export const WalletBalanceSchema = SchemaFactory.createForClass(WalletBalance).set(
    'versionKey',
    false
)

WalletBalanceSchema.index({walletId:1, coinId: 1, }, { unique: true});