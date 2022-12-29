import { ExchangeType, TransactionStatus } from "@config/constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


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
        enum : ExchangeType
    })
    transactionType: ExchangeType;
    
    @Prop({
        type: String,
        required: true,
        enum: TransactionStatus,
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