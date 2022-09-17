import { CompetitionStatusType } from '@config/constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
import { Types } from 'mongoose';
import { Reward } from '../entities/reward.entity';

export class Competition {


  @ApiProperty({
      type: Types.ObjectId
  })
  _id: Types.ObjectId; 
  
  @ApiProperty({
    type: String
  })
  name: string;

  @ApiProperty({

    type:Types.ObjectId,
  })
  userId: Types.ObjectId;


  @ApiProperty({
      type:String
  })
  logo?: string;

  @ApiProperty({
    type:String,
  })
  imageUrl?: string;

  @ApiProperty({
    type:Number,
  })
maxParticipants?: number;

@ApiProperty({
    type:Reward,
    required:true,
})
reward: Reward; 

//"pricing": "free if zero";
@ApiProperty({
    type: Date
}) 
startDate: Date;

  @ApiProperty({
    type: Date
  }) 
  endDate: Date;

  @ApiProperty({
    type:String,
    enum: CompetitionStatusType,
   
  })
  status: CompetitionStatusType

  @ApiProperty({
    type: Number
  })
  investmentAmount: number;

  @ApiProperty({
    type: []
  })
  intervalSymbolPrice?:Array<any>;
}






