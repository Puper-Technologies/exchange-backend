import { Type, Transform } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ObjectId } from 'mongodb';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { TokenEntity } from './token.entity';

class Data {
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: ObjectId = new ObjectId();

  cryptoCoin: TokenEntity = {
    name: String,
    rank: String,
    symbol: String,
    slug: String,
    description: String,
    marketCap: Array,
    isActive: Number,
    tokenAddress: '',
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
  symbolPair = '';
  quoteSymbol = '';
}

export default class CryptocoinResponseEntity {
  @ValidateNested({ each: true })
  @Type(() => Data)
  data?: [
    {
      _id: ObjectId;

      cryptoCoin: TokenEntity;
      symbolPair: string;
      quoteSymbol: string;
    },
  ] = [
    {
      _id: new ObjectId(),

      cryptoCoin: {
        name: String,
        rank: String,
        symbol: String,
        slug: String,
        description: String,
        marketCap: Array,
        isActive: Number,
        cmcId: Number,
        tokenAddress: '',
        logo: String,
        cmcRank: Number,
        circulatingSupply: Number,
        totalSupply: Number,
        tags: Array,
        dateLaunched: Date,
        category: String,
        website: Array,
      },
      symbolPair: '',
      quoteSymbol: '',
    },
  ];

  collectionName?: string = '';

  options?: {
    location: string;
    paginationParams: PaginationParamsInterface;
    totalCount: number;
  };
}
