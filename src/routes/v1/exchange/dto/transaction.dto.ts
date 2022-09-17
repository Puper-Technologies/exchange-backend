import { TransactionStatus, TransactionType } from "@config/constants";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Fill } from "../entities/fill.entity";

export class TransactionDto {
    @ApiProperty({ type: String })
    @IsString()
    userId: string;

    @ApiProperty({ type: String })
    @IsString()
    cryptocaseId: string;

    @ApiProperty({ type: String })
    @IsString()
    status: TransactionStatus;

    @ApiProperty({ type: String })
    @IsString()
    baseSymbol: string;

    @ApiProperty({ type: String })
    @IsString()
    quoteSymbol: string;

    @ApiProperty({ type: String })
    @IsString()
    exchange: string;

    @ApiProperty({ type: String })
    @IsString()
    transactionType: TransactionType;

    @ApiProperty({ type: Number })
    @IsNumber()
    cummulativeQuoteQtySell: number;

    @ApiProperty({ type: Number })
    @IsNumber()
    cummulativeBaseQtyBuy: number;

    @ApiProperty({ type: Number })
    @IsNumber()
    transactionFee: number;

    @ApiProperty({ type: Number })
    @IsNumber()
    transactionTime: number;
    
    @ApiProperty({ type: Array })
    @IsOptional()
    fills: Array<Fill>;
}