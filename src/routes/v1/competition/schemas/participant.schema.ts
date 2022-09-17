import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ParticipantStatusType, RewardType } from '@config/constants';
import { RedeemInfo, ValueType } from '../interfaces/reward.interface';
import { ExpertCryptocase } from '@v1/expert-cryptocase/entities/expert-cryptocase.entity';

@Schema({ timestamps: true })
export class Participant {

    @Prop({
        type : Types.ObjectId,
        required : true,
        ref: 'User'
    })
    userId:Types.ObjectId;

    @Prop({
        type : String
    })
    userFullName: string;

    @Prop({
        type : String
    })
    userEmail: string;  

    @Prop({
        type : String,
    })
    userAvatar?: string;

    @Prop({
        type : Types.ObjectId,
        ref:"Competition",
        required:true
    })
    // competitionId: Types.ObjectId;
    competition: Types.ObjectId;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: "ExpertCryptocase",
    })
    cryptoCaseRefId : Types.ObjectId;

    @Prop({
        type: ExpertCryptocase,
        default: null
    })
    cryptoCaseDetail ?: ExpertCryptocase;

    @Prop({
        type: Date
    })
    enrollDate : Date;

    @Prop({
        type:String,
        enum: ParticipantStatusType
    })
    participantStatus?: ParticipantStatusType;

    @Prop({
        type: Number,
        description:'initial amount alloted to participant'
    })
    investedPoints: number;

    @Prop({
        type: {
            rank : Number,
            gain : Number,
            currentCaseValue: Number
        }
    })
    performance?: {
        rank : Number,
        gain : Number,
        currentCaseValue: Number
    };

// 
    @Prop({
        type:{
            rewardType: {
                type: String,
                enum: RewardType
            },
            value: {
                type: Number,
                default: 0
            },
            expiry: {
                type: Date
            }
        },
        default: {
            // rewardType: RewardType.POINTS,
            value:0,
        }
    })
    reward?:
    {
        rewardType: string,
        value: number,
        expiry: Date
    };

    @Prop({
        type: Boolean,
        default: true
    })
    isUpdateable?: boolean;

    @Prop({
        type: Object
    })
    initialSymbolQty?: Object;

}

export type ParticipantDocument = Participant & Document;

export const ParticipantSchema = SchemaFactory.createForClass(Participant).set(
  'versionKey',
  false,
);

ParticipantSchema.index({ userId:1, competition:1 }, {unique:true});



