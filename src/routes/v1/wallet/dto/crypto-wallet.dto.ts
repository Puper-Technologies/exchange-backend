import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class WalletDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    coinId: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    balance: number;
}