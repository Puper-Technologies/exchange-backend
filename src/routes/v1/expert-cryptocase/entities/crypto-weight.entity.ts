import { CryptoWeightState } from "@config/constants";
import { ApiProperty } from "@nestjs/swagger";
import { Cryptocoin } from "@v1/cryptocoins/entities/cryptocoin.entity";
import { Transform } from "class-transformer";
import { Types } from "mongoose";

export class CryptoWeight {
  @Transform((value) => value.toString(), { toPlainOnly: true })
  _id?: Types.ObjectId = new Types.ObjectId();

  @ApiProperty({ type: Types.ObjectId})
  cryptocaseId: Types.ObjectId;

  @ApiProperty({ type: Cryptocoin })
  cryptoCoin: Cryptocoin;

  @ApiProperty({ type: Number })
  currentPercentage: number;

  @ApiProperty({ type: Number })
  lastPercentage: number;

  @ApiProperty({ type: String })
  coinState: CryptoWeightState;
  
  @ApiProperty({type: Number})
  initiallyAddedPrice: number;

  @ApiProperty({type: Number})
  overallPerformance?: number;
  
  @ApiProperty({type:Number})
  minQty: number;

  @ApiProperty({type:Number})
  minPrice: number;
}