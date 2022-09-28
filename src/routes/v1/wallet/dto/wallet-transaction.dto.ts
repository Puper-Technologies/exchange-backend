import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Types } from "mongoose";

export class WalletTransaction {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    walletId: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    transactionType: string;
}