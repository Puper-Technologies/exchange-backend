import { CryptoWeightState, WeightingScheme } from '@config/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Cryptocoin } from '@v1/cryptocoins/entities/cryptocoin.entity';
// import { Cryptocoin } from '@v1/cryptocoins/schemas/cryptocoin.schema';
import { Document, Types } from 'mongoose';

@Schema()
export class CryptoWeight {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: "ExpertCryptocase",
    })
    cryptocaseId: Types.ObjectId;

    @Prop({
        required: true,
        type: Cryptocoin,
    })
    cryptoCoin: Cryptocoin;

    @Prop({
        required: true,
        type: Number,
    })
    currentPercentage = 0;

    @Prop({
        type: Number,
    })
    lastPercentage = 0;

    // @Prop({type: String})
    // coinState: CryptoWeightState.UNLOCKED

    @Prop({
        type: String,
        required: false,
        default: CryptoWeightState.UNLOCKED,
      })
    coinState: CryptoWeightState;

    @Prop({
        type: Number,
        required:true,
    })  
    initiallyAddedPrice: number;

    @Prop({
        type: Number
    })
    minQty: number;

    @Prop({
        type: Number
    })
    minPrice: number;
}

export type CryptoWeightDocument = CryptoWeight & Document;

export const CryptoWeightSchema = SchemaFactory.createForClass(CryptoWeight).set(
    'versionKey',
    false,
);
