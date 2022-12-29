import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Wallet } from "./wallet.schema";


@Schema({timestamps: true})
export class EthereumWallet {

    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
        unique: true,
        ref: Wallet.name
    })
    walletId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
        unique: true
    })
    address: string;

    @Prop({
        type: Types.ObjectId,
        required: true,
        unique: true
    })
    privateKey: string;

}

export type EthereumWalletDocument = EthereumWallet & Document;

export const EthereumWalletSchema = SchemaFactory.createForClass(EthereumWallet);