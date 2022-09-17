import { CryptoWeightState } from '@config/constants';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { AddCryptoWeightDto } from './add-crypto-weight.dto';

export class UpdateCryptoWeightDto extends PartialType(AddCryptoWeightDto) {

    @ApiProperty({
        type: Number,
    })
    // @IsNotEmpty()
    // @IsNumber()
    percentage?: number;

    @ApiProperty({ type: 'enum', enum: CryptoWeightState })
    // @IsNotEmpty()
    coinState?: CryptoWeightState;
}
