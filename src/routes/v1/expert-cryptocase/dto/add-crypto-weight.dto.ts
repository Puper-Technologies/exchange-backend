import { ApiProperty } from "@nestjs/swagger";
import { Cryptocoin } from "@v1/cryptocoins/entities/cryptocoin.entity";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddCryptoWeightDto {

    @ApiProperty({
        type: String,
    })
    @IsNotEmpty()
    // @IsString()
    cryptocaseId: string;

    @ApiProperty({
        type: String,
    })
    @IsNotEmpty()
    // @IsString()
    expertId: string;

    @ApiProperty({
        type:String
    })
    @IsNotEmpty()
    cryptoCoinId: string;

    // @ApiProperty({
    //     type: Number,
    // })
    // @IsNotEmpty()
    // @IsNumber()
    // currentPercentage: number;

    // @ApiProperty({
    //     type: Number,
    // })
    // @IsNotEmpty()
    // @IsNumber()
    // lastPercentage: number;
}
