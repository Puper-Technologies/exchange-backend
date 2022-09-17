import { ApiProperty } from "@nestjs/swagger";


export class TickerPriceChangeStats {

    @ApiProperty({type: String})
    symbol: string;
    @ApiProperty({type: String})
    priceChange: string;

    @ApiProperty({type: String})
    priceChangePercent: string;

    @ApiProperty({type: String})
    weightedAvgPrice: string;

    @ApiProperty({type: String})
    prevClosePrice: string;

    @ApiProperty({type: String})
    lastPrice: string;

    @ApiProperty({type: String})
    lastQty: string;

    @ApiProperty({type: String})
    bidPrice: string;

    @ApiProperty({type: String})
    bidQty: string;

    @ApiProperty({type: String})
    askPrice: string;

    @ApiProperty({type: String})
    askQty: string;

    @ApiProperty({type: String})
    openPrice: string;

    @ApiProperty({type: String})
    highPrice: string;

    @ApiProperty({type: String})
    lowPrice: string;
    @ApiProperty({type: String})
    volume: string;
    @ApiProperty({type: String})
    quoteVolume: string;
    
    @ApiProperty({type: Number})
    openTime: number;
    @ApiProperty({type: Number})
    closeTime: number;
    @ApiProperty({type: Number})
    firstId: number;
    @ApiProperty({type: Number})
    lastId: number;
    @ApiProperty({type: Number})
    count: number;
    
}