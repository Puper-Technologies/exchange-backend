import { CryptoWeightState, WeightingScheme } from '@config/constants';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { CryptoWeight } from '../entities/crypto-weight.entity';
import { CreateExpertCryptocaseDto } from './create-expert-cryptocase.dto';
import { UpdateCryptoWeightsDto } from './update-crypto-weights.dto';

export class UpdateCryptocaseWithCryptoWeightDto extends PartialType(CreateExpertCryptocaseDto) {
    
    @ApiProperty({
        type: Array,
    })
    cryptoWeightageList?:UpdateCryptoWeightsDto[];
}
