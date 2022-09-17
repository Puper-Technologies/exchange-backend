import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RewardType } from '@config/constants';
import { RedeemInfo, ValueType } from '../interfaces/reward.interface';

@Schema({ timestamps: true })
export class Reward {

    @Prop({
        required: true,
        type: String,
    })
    name: string;

    @Prop({
        type:String,
        enum:RewardType,
        required:true
    })
    type: RewardType;

    @Prop(
        {
            type: [
                {
                    type: {
                        minRank: Number,
                        maxRank: Number,
                        earning: Number
                    }
                }
            ]
        }
    )
    value:{
        minRank: Number,
        maxRank: Number,
        earning: Number
    }[];

    @Prop({
        type: Number
    })
    totalValue: number;

    @Prop({
        type: RedeemInfo
    })
    redeemInfo?: RedeemInfo;

}

export type RewardDocument = Reward & Document;

export const RewardSchema = SchemaFactory.createForClass(Reward).set(
  'versionKey',
  false,
);




