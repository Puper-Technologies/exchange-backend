import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Cryptocoin } from './cryptocoin.entity';

export class CoinPair {
  @ApiProperty({ type: String })
  _id?: Types.ObjectId = new Types.ObjectId();

  @ApiProperty({ type: Cryptocoin })
  cryptoCoin?: Cryptocoin = {
    name: String,
    rank: String,
    symbol: String,
    slug: String,
    description: String,
    marketCap: Array,
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

  @ApiProperty({type: String})
  baseSymbol: '';

  @ApiProperty({ type: String })
  symbolPair = '';
}
