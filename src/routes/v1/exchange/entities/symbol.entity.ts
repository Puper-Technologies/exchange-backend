import { ApiProperty } from '@nestjs/swagger';
import { Filter } from './filter.entity';

export class Symbol {
  @ApiProperty({ type: String })
  symbol: string;

  @ApiProperty({ type: String })
  status: string;

  @ApiProperty({ type: String })
  baseAsset: string;

  @ApiProperty({ type: String })
  quoteAsset: string;

  @ApiProperty({ type: Number })
  baseAssetPrecision: number;

  @ApiProperty({ type: Number })
  quotePrecision: number;

  @ApiProperty({ type: Number })
  quoteAssetPrecision: number;

  @ApiProperty({ type: Number })
  baseCommissionPrecision: number;

  @ApiProperty({ type: Number })
  quoteCommissionPrecision: number;

  @ApiProperty({ type: Boolean })
  icebergAllowed: boolean;

  @ApiProperty({ type: Boolean })
  ocoAllowed: boolean;

  @ApiProperty({ type: Boolean })
  quoteOrderQtyMarketAllowed: boolean;

  @ApiProperty({ type: Boolean })
  isSpotTradingAllowed: boolean;

  @ApiProperty({ type: Boolean })
  isMarginTradingAllowed: boolean;

  @ApiProperty({ type: Array })
  filters: Array<Filter>;

  @ApiProperty({ type: Array })
  orderTypes: Array<string>;

  @ApiProperty({ type: Array })
  permissions: Array<string>;
}
