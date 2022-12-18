import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class WalletDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ type: Boolean })
    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;
}