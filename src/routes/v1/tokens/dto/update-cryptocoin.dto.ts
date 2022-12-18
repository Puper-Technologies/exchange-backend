import { PartialType } from '@nestjs/swagger';
import { CreateCryptocoinDto } from './create-cryptocoin.dto';

export class UpdateCryptocoinDto extends PartialType(CreateCryptocoinDto) {}
