import { CompetitionStatusType } from "@config/constants";
import { ApiProperty } from "@nestjs/swagger";
import { Cryptocoin } from "@v1/cryptocoins/entities/cryptocoin.entity";
import { IsDate, IsDateString, IsMongoId, isNotEmpty, IsNotEmpty, IsNumber, IsPositive, IsString, IsUrl } from "class-validator";
import { isValidObjectId, Types } from "mongoose";
import { RewardDto } from "./reward.dto";


export class CreateCompetitionDto {

    @ApiProperty({
        type: String
    })
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @ApiProperty({
        type: String
    })
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        type: String
    })
    @IsString()
    @IsUrl()
    logo?: string;
  
    @ApiProperty({
        type: String
    })
    @IsString()
    @IsUrl()
    imageUrl?: string; 
     
    @ApiProperty({
        type: Number
    })
    @IsNumber()
    maxParticipants?: number;
    
    @ApiProperty({
        type: RewardDto
    })
    reward: RewardDto; 
    
    @ApiProperty({
        type:Number
    })
    @IsNumber()
    @IsNotEmpty()
    pricing: number;

    @ApiProperty({
        type: Date
    })
    @IsDateString()
    @IsNotEmpty()
    startDate: Date;
    
    @ApiProperty({
        type: Date
    })
    @IsDateString()
    @IsNotEmpty()
    endDate: Date;

    @ApiProperty({
        type: String,
        enum: CompetitionStatusType,
    })
    @IsString()
    @IsNotEmpty()
    status: CompetitionStatusType;

    @ApiProperty({
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    investmentAmount : number;
}
