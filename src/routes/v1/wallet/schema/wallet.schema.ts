
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema()
export class Wallet {

    @Prop({
        type: Types.ObjectId,
        index:true
    })
   userId: Types.ObjectId;

   @Prop({
       type: {
           cash: {
               type: Number,
               default: 0
           },
           points: {
               type: Number,
               default:0
           }
       }
   })
   wallet?;

}

export type WalletDocument = Wallet & Document;
export const WalletSchema = SchemaFactory.createForClass(Wallet).set(
    'versionKey',
    false
)
