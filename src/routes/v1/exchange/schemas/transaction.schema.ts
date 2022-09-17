import { TransactionStatus, TransactionType } from "@config/constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Fill } from "../entities/fill.entity";

@Schema()
export class Transaction {
    @Prop({
        required: true,
        type: Types.ObjectId
    })
    userId: Types.ObjectId;

    @Prop({
        required: true,
        type: String,
        // default: TransactionType.NONE,
    })
    cryptocaseId: string

    @Prop({
        required: true,
        type: String,
        // default: TransactionType.NONE,
    })
    transactionType: TransactionType

    @Prop({
        // required: true,
        type: String,
        // default: null,
    })
    status: TransactionStatus;

    @Prop({
        required: true,
        type: Number
    })
    cummulativeQuoteQtySell: number;

    @Prop({
        required: true,
        type: String
    })
    quoteSymbol: string;

    @Prop({
        required: true,
        type: Number
    })
    cummulativeBaseQtyBuy: number;

    @Prop({
        required: true,
        type: String
    })
    baseSymbol: string;

    //change to type fills
    @Prop({
        required: true,
        type: Array
    })
    fills: Array<Fill>;

    @Prop({
        // required: true,
        type: Number
    })
    transactionFee: number;

    @Prop({
        required: true,
        type: Number
    })
    transactionTime: number;

    @Prop({
        required: true,
        type: String
    })
    platform: string;

}

export type TransactionDocument = Transaction & Document;
export const TransactionSchema = SchemaFactory.createForClass(Transaction).set(
    'versionKey',
    false
)
