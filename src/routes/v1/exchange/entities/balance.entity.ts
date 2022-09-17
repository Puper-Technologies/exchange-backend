import { ApiProperty } from "@nestjs/swagger";


export class Balance {
    @ApiProperty({type: String})
    asset: string;

    @ApiProperty({type: Number})
    free: number;
    
    @ApiProperty({type: Number})
    locked: number;
}