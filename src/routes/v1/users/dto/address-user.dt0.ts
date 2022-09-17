import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class AddressUserDto {
    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    area: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    locality: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    dist: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    state: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    country: string;

    @ApiProperty({ type: Number })
    @IsOptional()
    @IsNumber()
    pincode: number;
}