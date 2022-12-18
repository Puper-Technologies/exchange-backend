import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({timestamps: true})
export class WalletBalance {

    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,

    })
    wallet: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true
    })
    token: Types.ObjectId;

    @Prop({
        type: Number,
        default: 0
    })
    balance: number;
}

export type WalletBalanceDocument = WalletBalance & Document;

export const WalletBalanceSchema = SchemaFactory.createForClass(WalletBalance).set(
    'versionKey',
    false,
  );
  
  WalletBalanceSchema.index({ wallet:1, token: 1 }, { unique: true })