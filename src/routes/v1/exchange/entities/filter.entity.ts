import { ApiProperty } from '@nestjs/swagger';

export class Filter {
  @ApiProperty({ type: String })
  filterType: string;

  @ApiProperty({ type: Number })
  minPrice: number;

  @ApiProperty({ type: Number })
  maxPrice: number;

  @ApiProperty({ type: Number })
  tickSize: number;

  @ApiProperty({ type: String })
  multiplierUp: string;

  @ApiProperty({ type: String })
  multiplierDown: string;

  @ApiProperty({ type: Number })
  avgPriceMins: number;

  @ApiProperty({ type: Number })
  minQty: number;

  @ApiProperty({ type: Number })
  maxQty: number;

  @ApiProperty({ type: Number })
  stepSize: number;

  @ApiProperty({ type: Number })
  limit: number;

  @ApiProperty({ type: String })
  minNotional: string;

  @ApiProperty({ type: Boolean })
  applyToMarket: boolean;

  @ApiProperty({ type: Number })
  maxNumOrders: number;

  @ApiProperty({ type: Number })
  maxNumAlgoOrders: number;
}
