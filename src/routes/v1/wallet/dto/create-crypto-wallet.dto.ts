import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateWalletDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    balance: number;
}