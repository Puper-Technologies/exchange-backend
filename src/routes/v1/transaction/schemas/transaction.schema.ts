import { TransactionType } from "@config/constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { TransactionStatus } from "aws-sdk/clients/rdsdataservice";

@Schema({timestamps: true})
export class Transaction {
    @Prop({
        type: String,
        required: true
    })
    from: string;

    @Prop({
        type: String,
        required: true
    })
    to: string; 

    @Prop({
        type: String,
        requried: true,
        enum : TransactionType
    })
    transactionType: TransactionType;
    
    @Prop({
        type: String,
        required: true,
        enum: TransactionType,
        default: 'pending'
    })
    status: TransactionStatus;

    @Prop({
        type: Number,
        required: true,
    })
    transactionTime: number;

}

export type TransactionDocument = Document & Transaction;

export const TransactionSchema = SchemaFactory.createForClass(Transaction);