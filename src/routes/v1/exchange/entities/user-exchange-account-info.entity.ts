import { ApiProperty } from '@nestjs/swagger';
import { Balance } from './balance.entity';

export class UserExchangeAccountInfo {
  @ApiProperty({ type: Number })
  makerCommission: number;
  @ApiProperty({ type: Number })
  takerCommission: number;
  @ApiProperty({ type: Number })
  buyerCommission: number;
  @ApiProperty({ type: Number })
  sellerCommission: number;

  @ApiProperty({ type: Number })
  updateTime: number;

  @ApiProperty({ type: Boolean })
  canTrade: boolean;

  @ApiProperty({ type: Boolean })
  canWithdraw: boolean;

  @ApiProperty({ type: Boolean })
  canDeposit: boolean;

  @ApiProperty({ type: String })
  accountType: string;

  @ApiProperty({ type: [Balance] })
  balances: Balance[];

  @ApiProperty({ type: Array })
  permissions: Array<string>;
}
