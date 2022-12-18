import { TransactionType } from "@config/constants";
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateOrderDto {

    @IsString()
    @IsNotEmpty()
    exchangePair: string;

    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsNumber()
    @IsPositive()
    limit: number;

    @IsEnum(TransactionType)
    orderType: TransactionType;

    @IsNumber()
    @IsPositive()
    amount: number;

}