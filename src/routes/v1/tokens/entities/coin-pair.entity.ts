import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { TokenEntity } from './token.entity';

export class CoinPair {
  @ApiProperty({ type: String })
  _id?: Types.ObjectId = new Types.ObjectId();

  @ApiProperty({ type: TokenEntity })
  cryptoCoin: TokenEntity = {
    name: String,
    rank: String,
    symbol: String,
    slug: String,
    description: String,
    marketCap: Array,
    tokenAddress:String,
    isActive: Number,
    cmcId: Number,
    logo: String,
    cmcRank: Number,
    circulatingSupply: Number,
    totalSupply: Number,
    tags: Array,
    dateLaunched: Date,
    category: String,
    website: Array,
  };

  @ApiProperty({ type: String })
  quoteSymbol = '';

  @ApiProperty({ type: String })
  baseSymbol?: '';

  @ApiProperty({ type: String })
  symbolPair = '';
}
