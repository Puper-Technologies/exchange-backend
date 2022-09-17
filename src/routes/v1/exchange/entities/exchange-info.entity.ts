import { ApiProperty } from "@nestjs/swagger";
import { RateLimit } from "./rate-limit.entity";
import { Symbol } from "./symbol.entity";

export class ExchangeInfo {

    @ApiProperty({type: String})
    timezone: string;

    @ApiProperty({type: Number})
    serverTime: number;

    @ApiProperty({type: RateLimit})
    rateLimits: RateLimit;

    @ApiProperty({type: Array})
    exchangeFilters: [];

    @ApiProperty({type: Symbol})
    symbols: Symbol;
}