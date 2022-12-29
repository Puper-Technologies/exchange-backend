
import { StatusType } from "@config/constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps:true })
export class Wallet {

    _id?: Types.ObjectId;
    
    @Prop({
        type: Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    })
    userId: Types.ObjectId;   // owner of this wallet
    
    @Prop({
        type: String,
        enum: StatusType,
        default: true
    })
    status?: StatusType;

}

export type WalletDocument = Wallet & Document;

export const WalletSchema = SchemaFactory.createForClass(Wallet).set(
    'versionKey',
    false
)
