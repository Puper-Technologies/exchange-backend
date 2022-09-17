import { CryptoWeightState, DomainType, VolatilityType, WeightingScheme } from "@config/constants";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Types } from "mongoose";
import { CryptocasePricing } from "../interfaces/expert-portfolio.interface";

export class CreateExpertCryptocaseDto {

    @ApiProperty({
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    expertId: string;

    @ApiProperty({
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    subtitle: string;

    @ApiProperty({
        type: String,
        enum: DomainType
    })
    @IsNotEmpty()
    @IsString()
    domain: DomainType;

    @ApiProperty({
        type: String,
        enum: VolatilityType
    })
    // @IsNotEmpty()
    @IsString()
    volatility: VolatilityType;

    @ApiProperty({
        type:String
    })
    @IsString()
    @IsNotEmpty()
    exchange: string;

    @ApiProperty({
        type: CryptocasePricing
    })
    @IsNotEmpty()
    pricing: CryptocasePricing;

    @ApiProperty({
        type: [String ]
    })
    tags?: string[];


    @ApiProperty({
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    quoteSymbol: string;

    @ApiProperty({
        type: Array,
    })
    @IsNotEmpty()
    cryptoCurrencyIdList: string[];

    @ApiProperty({
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    weightingScheme: WeightingScheme;

    // @ApiProperty({
    //     type: String,
    // })
    // @IsString()
    // state: CryptoWeightState;

    @ApiProperty({
        type:String,
        description: 'image url of the cryptocase'
    })
    imageUrl?: string;
}
