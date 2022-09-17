import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export default class ValidateOtpUserDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    // @IsNumber()
    mobileNo: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    otpValue: number;

    @ApiProperty({ type: Number })
    @IsOptional()
    @IsNumber()
    expiryTime: number;
}