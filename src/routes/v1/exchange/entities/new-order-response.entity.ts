import { TransactionStatus, TransactionType } from '@config/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Fill } from './fill.entity';

export class NewOrderResponse {
  @ApiProperty({ type: String })
  symbol: string;

  @ApiProperty({ type: Number })
  orderId: number;

  @ApiProperty({ type: String })
  clientOrderId: string;

  @ApiProperty({ type: Number })
  orderListId: number;

  @ApiProperty({ type: Number })
  price: number;

  @ApiProperty({ type: Number })
  transactTime: number;

  @ApiProperty({ type: Number })
  origQty: number;

  @ApiProperty({ type: Number })
  executedQty: number;

  @ApiProperty({ type: Number })
  cummulativeQuoteQty: number;

  @ApiProperty({ type: String })
  transactionStatus: TransactionStatus;

  @ApiProperty({ type: String })
  timeInForce: string;

  @ApiProperty({ type: String })
  transactionType: TransactionType;

  @ApiProperty({ type: String })
  side: string;

  @ApiProperty({ type: Array })
  fills: Array<Fill>;
}
