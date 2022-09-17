import { CompetitionStatusType, ParticipantStatusType } from "@config/constants";
import { ApiProperty } from "@nestjs/swagger";
import { Cryptocoin } from "@v1/cryptocoins/entities/cryptocoin.entity";
import { IsDate, IsDateString, IsMongoId, isNotEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { isValidObjectId, Types } from "mongoose";
import { RewardDto } from "./reward.dto";


export class CreateParticipantDto {

    // @ApiProperty({
    //     type : String,
    //     description: 'User Id of the participant'
    // })
    // @IsMongoId()
    // @IsNotEmpty()
    // userId: string;

    @ApiProperty({
        type : String,
        description:"Id of the cryptocase with which participant will enroll"
    })
    @IsMongoId()
    @IsNotEmpty()
    cryptoCaseRefId : Types.ObjectId;

    // @ApiProperty({
    //     type: Date
    // })
    // @IsDateString()
    // @IsNotEmpty()
    // enrollDate : Date;

    // @ApiProperty({
    //     type: Number
    // })
    // investedPoints: number;

    // @Prop({
    //     type: {
    //         rank : Number,
    //         gain : Number,
    //         currentCaseValue: Number,
    //         caseData : [
    //             {
    //                 timestamp: Number,  // epoch time
    //                 value: Number
    //             }
    //         ]
    //     }
    // })
    // performance?;

}
