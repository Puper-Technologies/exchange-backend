import { Type, Transform } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ObjectId } from 'mongodb';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { Cryptocoin } from '@v1/cryptocoins/entities/cryptocoin.entity';
import { CryptoWeight } from './crypto-weight.entity';

class Data {
    @Transform(({ value }) => value.toString(), { toPlainOnly: true })
    _id: ObjectId = new ObjectId();

    weightingScheme: string = ''
    cryptoWeightageList: CryptoWeight[] = []
    description: string = '';
    expertId: string = '';
    quoteSymbol: string = '';
}

export default class ExpertPortfolioResponseEntity {
    @ValidateNested({ each: true })
    @Type(() => Data)
    data?: [{
        _id: string;

        weightingScheme: string;
    cryptoWeightageList: CryptoWeight[];
    description: string;
    expertId: string;
    quoteSymbol: string
    }] = [{
        _id: '',

    weightingScheme:'',
    cryptoWeightageList: [],
    description: '',
    expertId: '',
    quoteSymbol: '',

    }]

    collectionName?: string = '';

    options?: {
        location: string,
        paginationParams: PaginationParamsInterface,
        totalCount: number,
    }
}
