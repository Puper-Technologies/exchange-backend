import { TransactionStatus, TransactionType } from "@config/constants";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { Fill } from "../entities/fill.entity";

export class TransactionEntity {
    @ApiProperty({ type: Types.ObjectId })
    userId: Types.ObjectId;

    @ApiProperty({ type: String})
    cryptocaseId: string;
    
    @ApiProperty({ type: String })
    status: TransactionStatus;

    @ApiProperty({ type: String })
    baseSymbol: string;

    @ApiProperty({ type: String })
    quoteSymbol: string;

    @ApiProperty({ type: String })
    transactionType: TransactionType;
    
    @ApiProperty({ type: String })
    platform: string;

    @ApiProperty({ type: Number })
    cummulativeQuoteQtySell: number;

    @ApiProperty({ type: Number })
    cummulativeBaseQtyBuy: number;

    @ApiProperty({ type: Number })
    transactionFee: number;

    @ApiProperty({ type: Number })
    transactionTime: number;
    
    @ApiProperty({ type: Array })
    fills: Array<Fill>;
}