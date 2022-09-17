import { CompetitionStatusType } from '@config/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { Reward } from '../entities/reward.entity';
import { Reward } from './reward.schema';

@Schema({ timestamps: true })
export class Competition {

  @Prop({
    required: true,
    type: String,
  })
  name: string;

  @Prop({
      required:true,
      type:Types.ObjectId,
      ref:"User"
  })
  userId: Types.ObjectId;

  @Prop({
      type:String
  })
  logo?: string;

  @Prop({
    type:String,
  })
  imageUrl?: string; 
  
  @Prop({
    type:Number,
  })
  maxParticipants: number;

  @Prop({
      type:Reward,
      required:true,
  })
  reward: Reward; 

  @Prop({
    type: Number,
    default:0
  })
  pricing?: number = 0;

  @Prop({
      type: Date
  }) 
  startDate: Date;

  @Prop({
    type: Date
  }) 
  endDate: Date;

  @Prop({
    type:String,
    enum: CompetitionStatusType,
    required: true,
    default:CompetitionStatusType.DRAFT
  })
  status: CompetitionStatusType

  @Prop({
    type: Number,
    description: 'initial amount alloted to participant for this competition'
  })
  investmentAmount: number;

}

export type CompetitionDocument = Competition & Document;

export const CompetitionSchema = SchemaFactory.createForClass(Competition).set(
  'versionKey',
  false,
);





