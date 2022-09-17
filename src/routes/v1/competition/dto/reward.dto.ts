import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { RewardType } from "@config/constants";
// import { RedeemInfo, ValueType } from "../interfaces/reward.interface";

class ValueType {

    @ApiProperty({
        type: Number
    })
    @IsNumber()
    minRank: Number;

    @ApiProperty({
        type: Number
    })
    @IsNumber()
    maxRank: Number;

    @ApiProperty({
        type: Number
    })
    @IsNumber()
    earning: Number;
}


class RedeemInfo {

    @ApiProperty({
        type: Array
    })
    @IsArray()
    guidelines: string[];

    @ApiProperty({
        type: Array
    })
    @IsArray()
    conditions: string[];

    @ApiProperty({
        type: Date
    })
    @IsDate()
    expiry: Date;

}

export class RewardDto {

    @ApiProperty({
        type: String
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        type: String,
        enum: RewardType,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    type: RewardType;

    @ApiProperty(
        {
            type: [ValueType]
        }
    )
    value: ValueType[];

    @ApiProperty({
        type: Number
    })
    @IsNumber()
    totalValue: number;

    @ApiProperty({
        type: RedeemInfo
    })
    redeemInfo?: {
        guidelines: string[];
        conditions: string[];
        expiry: Date;
    };
}