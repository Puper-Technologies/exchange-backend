import { ExchangeStatus, ExchangeType } from '@config/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Fill } from '../entities/fill.entity';
@Schema()
export class Exchange {
  @Prop({
    required: true,
    type: Types.ObjectId,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    // default: ExchangeType.NONE,
  })
  ExchangeType: ExchangeType;

  @Prop({
    // required: true,
    type: String,
    // default: null,
  })
  status: ExchangeStatus;

  @Prop({
    required: true,
    type: Number,
  })
  cummulativeQuoteQtySell: number;

  @Prop({
    required: true,
    type: String,
  })
  quoteSymbol: string;

  @Prop({
    required: true,
    type: Number,
  })
  cummulativeBaseQtyBuy: number;

  @Prop({
    required: true,
    type: String,
  })
  baseSymbol: string;

  @Prop({
    // required: true,
    type: Number,
  })
  ExchangeFee: number;

  @Prop({
    required: true,
    type: Number,
  })
  ExchangeTime: number;

  @Prop({
    // required: true,
    type: String,
  })
  platform: string;
}

export type ExchangeDocument = Exchange & Document;
export const ExchangeSchema = SchemaFactory.createForClass(Exchange).set(
  'versionKey',
  false,
);
