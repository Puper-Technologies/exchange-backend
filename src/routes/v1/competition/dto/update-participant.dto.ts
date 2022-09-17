import { ParticipantStatusType } from "@config/constants";
import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { ExpertCryptocase } from "@v1/expert-cryptocase/entities/expert-cryptocase.entity";
import { CreateParticipantDto } from "./create-participant.dto";

export class UpdateParticipantDto extends PartialType(CreateParticipantDto){
    

    // participant's status can only be updated by either during deletion or creation of participants
    // @ApiProperty({
    //     type:String,
    //     enum:ParticipantStatusType
    // })
    participantStatus?:ParticipantStatusType;

    // this filed is not allowed to be modified from controller
    // @ApiProperty({
    //     type: Boolean
    // })
    isUpdateable?: boolean;

    // This filed get auto populated
    // @ApiProperty({
    //     type: ExpertCryptocase
    // })
    cryptoCaseDetail?;


    
    // @ApiProperty({
    //     type: {
    //         rank: Number,
    //         gain: Number,
    //         currentCaseValue: Number
    //     }
    // })
    performance?: any;

    // @ApiProperty({
    //     type:Object
    // })
    initialSymbolQty?: Object;
    

    reward?: {
        rewardType: string,
        value: number,
        expiry: Date
    }
}