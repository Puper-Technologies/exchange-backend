import { ParticipantStatusType } from "@config/constants";
import { ApiProperty } from "@nestjs/swagger";
import { ExpertCryptocase } from "@v1/expert-cryptocase/entities/expert-cryptocase.entity";
import { Types } from "mongoose";

export class Participant {

    @ApiProperty({
        type: Types.ObjectId
    })
    _id?: Types.ObjectId;

    @ApiProperty({
        type : Types.ObjectId,
    })
    userId: Types.ObjectId;

    @ApiProperty({
        type : String
    })
    userFullName: string;

    @ApiProperty({
        type : String
    })
    userEmail: string;

    @ApiProperty({
        type : String,
    })
    userAvatar?: string;

    @ApiProperty({
        type : Types.ObjectId,
    })
    competition: Types.ObjectId;

    @ApiProperty({
        type: ExpertCryptocase
    })
    cryptoCaseRefId : ExpertCryptocase | Types.ObjectId;

    @ApiProperty({
        type: ExpertCryptocase
    })
    cryptoCaseDetail?: ExpertCryptocase;

    @ApiProperty({
        type: Date
    })
    enrollDate : Date;

    @ApiProperty({
        type:String,
        enum: ParticipantStatusType
    })
    participantStatus?: ParticipantStatusType;

    @ApiProperty({
        type: Number
    })
    investedPoints: number;

    @ApiProperty({
        type: {
            rank : Number,
            gain : Number,
            currentCaseValue: Number,
            caseData : [
                {
                    timestamp: Number,  // epoch time
                    value: Number
                }
            ]
        }
    })
    performance?;


    @ApiProperty({
        type:{
            rewardType: String,
            value: Number,
            expiry: Date
        }
    })
    reward?: {
        rewardType: string,
        value: number,
        expiry: Date
    };

    @ApiProperty({
        type: Boolean
    })
    isUpdateable?: boolean;

    @ApiProperty({
        type: Object
    })
    initialSymbolQty?:Object;
    
}