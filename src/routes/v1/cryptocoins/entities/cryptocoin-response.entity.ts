import { Type, Transform } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ObjectId } from 'mongodb';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';

class Data {
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: ObjectId = new ObjectId();

  name: string = '';
  rank: number = 0;
  symbol: string = '';
}

export default class CryptocoinResponseEntity {
  @ValidateNested({ each: true })
  @Type(() => Data)
  data?: [{
    _id: ObjectId;

    name: string;
    rank: number;

    symbol: string;

  }] = [{
    _id: new ObjectId(),

    name: '',
    rank: 0,
    symbol: '',

  }]

  collectionName?: string = '';

  options?: {
    location: string,
    paginationParams: PaginationParamsInterface,
    totalCount: number,
  }
}
