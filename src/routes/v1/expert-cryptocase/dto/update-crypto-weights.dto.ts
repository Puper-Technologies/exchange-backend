import { CryptoWeightState } from '@config/constants';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { AddCryptoWeightDto } from './add-crypto-weight.dto';

export class UpdateCryptoWeightsDto extends PartialType(AddCryptoWeightDto) {

    @ApiProperty({
        type: Number,
    })
    // @IsNotEmpty()
    // @IsNumber()
    percentage?: number;

    @ApiProperty({
        type: String,
    })
    _id?: string;

    @ApiProperty({ type: 'enum', enum: CryptoWeightState })
    // @IsNotEmpty()
    coinState?: CryptoWeightState;

    @ApiProperty({ type: Boolean})
    changed?: Boolean;
}
