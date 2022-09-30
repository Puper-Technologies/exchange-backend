import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCryptocoinPairDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  baseSymbol: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  quoteSymbol: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  symbolPair: string;
}
