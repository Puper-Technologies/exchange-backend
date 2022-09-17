import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Fill {
    @Prop({
        type: String
    })
    price: string;

    @Prop({
        type: String
    })
    qty: string;

    @Prop({
        type: String
    })
    commission: string;

    @Prop({
        type: String
    })
    commissionAsset: string;

    @Prop({
        type: Number
    })
    tradeId: number;
}

export type FillDocument = Fill & Document;

export const FillScehama = SchemaFactory.createForClass(Fill).set(
    'versionKey',
    false
)