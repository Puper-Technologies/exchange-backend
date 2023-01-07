import { ExchangeType } from "@config/constants";
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateOrderDto {

    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    exchangePair: string;

    @IsNumber()
    @IsPositive()
    limit: number;

    @IsEnum(ExchangeType)
    orderType: ExchangeType;

    @IsNumber()
    @IsPositive()
    amount: number;
}