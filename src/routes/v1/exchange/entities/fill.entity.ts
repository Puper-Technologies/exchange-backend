import { ApiProperty } from "@nestjs/swagger";


export class Fill {

    @ApiProperty({type: String})
    price: string;

    @ApiProperty({type: Number}) //check with number
    qty: number;

    @ApiProperty({type: String})
    commission: string;

    @ApiProperty({type: Number})
    tradeId: number;

    @ApiProperty({type: String})
    commissionAsset: string;

    
}