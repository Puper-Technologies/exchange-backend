import { CryptocaseType, DomainType, VolatilityType, WeightingScheme } from "@config/constants";
import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";
import { CryptocasePricing } from "../interfaces/expert-portfolio.interface";
import { CryptoWeight } from "./crypto-weight.entity";

export class ExpertCryptocase {
  @ApiProperty({ type: String })
  _id?: Types.ObjectId = new Types.ObjectId();

  @ApiProperty({ type: String})
  name: string= '';

  @ApiProperty({ type: Types.ObjectId })
  expertId: Types.ObjectId;

  @ApiProperty({ type: String, enum: DomainType })
  domain: DomainType;

  @ApiProperty({type:String, enum: VolatilityType})
  volatility: VolatilityType;

  @ApiProperty({ type: CryptocasePricing })
  pricing: CryptocasePricing;

  @ApiProperty({ type: [String] })
  tags?: string[];

  @ApiProperty({ type: String })
  exchange: string;
  
  @ApiProperty({ type: String })
  quoteSymbol: string = '';

  @ApiProperty({ type: String })
  description: string = '';

  @ApiProperty({ type: String })
  subtitle: string = '';

  @ApiProperty({ type: Array })
  cryptoWeightageList ?: CryptoWeight[] | Types.ObjectId[];

  @ApiProperty({ type: String })
  weightingScheme: WeightingScheme;

  @ApiProperty({ type: String })
  caseType: CryptocaseType;

  @ApiProperty({type:String})
  imageUrl?:string;
  
}