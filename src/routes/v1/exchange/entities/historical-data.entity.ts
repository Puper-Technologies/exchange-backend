import { ApiProperty } from '@nestjs/swagger';

export class HistoricalExchangeData {
  @ApiProperty({ type: Number })
  closeTime: number;

  @ApiProperty({ type: Number })
  OpenPrice: number;

  @ApiProperty({ type: Number })
  HighPrice: number;

  @ApiProperty({ type: Number })
  LowPrice: number;

  @ApiProperty({ type: Number })
  ClosePrice: number;

  @ApiProperty({ type: Number })
  Volume: number;

  @ApiProperty({ type: Number })
  QuoteVolume: number;
}
