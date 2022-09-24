
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps:true })
export class Wallet {

    @Prop({
        type: Types.ObjectId,
        ref: "User",
        index: true,
        required: true
    })
    userId: Types.ObjectId;   // owner of this wallet

    @Prop({
        type: Types.ObjectId,
        ref: "Coin",
        required: true
    })
    coinId: Types.ObjectId; 

    @Prop({
        type: Number,
        required: true,
        default: 0
    })
    balance: number;

    @Prop({
        type: Boolean,
        required: true,
        default: true
    })
    isActive: boolean;

}

export type WalletDocument = Wallet & Document;

export const WalletSchema = SchemaFactory.createForClass(Wallet).set(
    'versionKey',
    false
)

WalletSchema.index({userId:1, coinId: 1, }, { unique: true});