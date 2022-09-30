import { ApiProperty } from '@nestjs/swagger';

export class RateLimit {
  @ApiProperty({ type: String })
  rateLimitType: string;

  @ApiProperty({ type: Number })
  intervalNum: number;

  @ApiProperty({ type: String })
  interval: string;

  @ApiProperty({ type: Number })
  limit: number;
}
