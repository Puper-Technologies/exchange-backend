import { Platform } from '@config/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class CompetitionPriceHistory {

    @Prop({
        type: String,
        default: Platform.BINANCE
    })
    exchange?:Platform = Platform.BINANCE;

    @Prop({
        type: Types.ObjectId,
        required: true,
        index: true
    })
    competitionId: Types.ObjectId;

    @Prop({
        type:Array,
        default: []
    })
    priceHistory?: any[] = [];

}

export type CompetitionPriceHistoryDocument = CompetitionPriceHistory & Document;

export const CompetitionPriceHistorySchema = SchemaFactory.createForClass(CompetitionPriceHistory).set(
  'versionKey',
  false,
);





