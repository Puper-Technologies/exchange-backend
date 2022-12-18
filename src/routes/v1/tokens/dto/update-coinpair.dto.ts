import { PartialType } from '@nestjs/swagger';
import { CreateCryptocoinPairDto } from './create-cryptocoin-pair.dto';

export class UpdateCoinPairDto extends PartialType(CreateCryptocoinPairDto) {}
