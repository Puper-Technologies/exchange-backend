import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cryptocoin {
  @Prop({
    required: true,
    type: String,
  })
  name;

  @Prop({
    type: Number,
    default: 0,
    required: false,
  })
  rank?;

  @Prop({
    required: true,
    unique: true,
    sparse: true,
    type: String,
  })
  symbol;

  @Prop({
    type: String,
  })
  slug;

  @Prop({
    type: String,
  })
  description;

  @Prop({
    type: Array,
  })
  marketCap;

  @Prop({
    default: 1,
    type: Number,
  })
  isActive;

  @Prop({
    type: String,
  })
  cmcId;

  @Prop({
    required: true,
    type: String,
  })
  logo;

  @Prop({
    type: Number,
  })
  cmcRank;

  @Prop({
    type: Number,
  })
  circulatingSupply;

  @Prop({
    type: Number,
  })
  totalSupply;

  @Prop({
    type: Array,
  })
  tags;

  @Prop({
    type: Date,
  })
  dateLaunched;

  @Prop({
    required: true,
    type: String,
  })
  category;

  @Prop({
    type: Array,
  })
  website;
}

export type CryptocoinDocument = Cryptocoin & Document;

export const CryptocoinSchema = SchemaFactory.createForClass(Cryptocoin).set(
  'versionKey',
  false,
);
