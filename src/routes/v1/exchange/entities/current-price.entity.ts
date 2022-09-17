import { ApiProperty } from "@nestjs/swagger";


export class CurrentPrice {
    @ApiProperty({type: String})
    symbol: string;

    @ApiProperty({type: Number})
    price: number;
    
}