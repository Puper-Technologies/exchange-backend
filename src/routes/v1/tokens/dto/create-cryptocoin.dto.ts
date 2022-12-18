import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateCryptocoinDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  rank?: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @ApiProperty({ type: String })
  @IsString()
  slug?: string;

  @ApiProperty({ type: String })
  @IsString()
  description?: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  marketCap?: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  isActive: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  cmcId: number;

  @ApiProperty({ type: String })
  @IsString()
  logo?: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  cmcRank?: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  circulatingSupply?: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  totalSupply?: number;

  @ApiProperty({ type: Array })
  @IsArray()
  tags?: [];

  @ApiProperty({ type: Date })
  @IsDate()
  dateLaunched?: Date;

  @ApiProperty({ type: String })
  @IsString()
  category?: string;

  @ApiProperty({ type: Array })
  @IsArray()
  website?: [];
}
