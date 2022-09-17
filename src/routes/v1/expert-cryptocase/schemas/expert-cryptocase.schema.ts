import { CryptocaseType, DomainType, VolatilityType, WeightingScheme } from '@config/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CryptocasePricing } from '../interfaces/expert-portfolio.interface';
// import { CryptoWeight } from '../entities/crypto-Weight.entity';
import { CryptoWeightSchema, CryptoWeightDocument, CryptoWeight } from './crypto-weight.schema';

@Schema({ timestamps: true })
export class ExpertCryptocase {

  @Prop({
    required: true,
    type: String,
  })
  name: string = '';

  // @Prop({
  //   // required: true,
  //   type: String,
  //   default: null
  // })
  // logo: string;

  // @Prop({
  //   // required: true,
  //   type: String,
  //   default: null
  // })
  // coverImage: string;
  
  @Prop({
    type: String,
    required:true,
    enum:DomainType
  })
  domain: DomainType;

  @Prop({
    type: String,
    required: true,
  })
  exchange: string;

  @Prop({
    type: String,
    required: true,
    enum:VolatilityType,
    default: VolatilityType.HIGH
  })
  volatility: VolatilityType;

  @Prop({
    type: [],
  })
  tags?: Array<string>;
  
  @Prop({
    type: CryptocasePricing,
    default:{
      free:true,
      weekly:0,
      monthly:0,
      yearly:0,
    }
  })
  pricing: CryptocasePricing;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref:"User"
  })
  expertId: Types.ObjectId;

  @Prop({
    // required: true,
    type: String,
  })
  description = '';

  @Prop({
    type: String,
    // required: true,
  })
  subtitle: string;

  @Prop({
    required: true,
    // unique: true,
    type: String,
  })
  quoteSymbol = '';

  @Prop({
    type:[
    {
      type:Types.ObjectId,
      ref:'CryptoWeight'
    }
  ]})
  cryptoWeightageList: Array<Types.ObjectId>;  //refactor

  @Prop({
    type: String,
    required: false,
    default: WeightingScheme.EQUI_WEIGHTED,
  })
  weightingScheme: WeightingScheme;

  @Prop({
    type: String,
    default: CryptocaseType.PRIVATE
  })
  caseType: CryptocaseType;

  @Prop({
    type: String,
  })
  imageUrl?: string;
}



export type ExpertCryptocaseDocument = ExpertCryptocase & Document;

export const ExpertCryptocaseSchema = SchemaFactory.createForClass(ExpertCryptocase).set(
  'versionKey',
  false,
);


