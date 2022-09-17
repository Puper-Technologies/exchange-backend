import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CreateCryptocoinDto } from '../dto/create-cryptocoin.dto';

@Schema()
export class CoinsPair {

  @Prop({
    required: true,
    type: CreateCryptocoinDto,
  })
  cryptoCoin: CreateCryptocoinDto;

  @Prop({
    required: true,
    type: String,
  })
  quoteSymbol = '';

  @Prop({
    required: true,
    unique: true,
    type: String,
  })
  symbolPair = '';
}

export type CoinsPairDocument = CoinsPair & Document;

export const CoinsPairSchema = SchemaFactory.createForClass(CoinsPair).set(
  'versionKey',
  false,
);
