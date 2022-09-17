import { RolesEnum } from '@decorators/roles.decorator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ExchangeUserDto } from './exchange-user-dto';
import { OtpUserDto } from './otp-user.dto';
import { SignUpDto } from './sign-up.dto';

export default class UpdateUserDto extends PartialType(SignUpDto) {

    // @ApiProperty({ type: 'enum', enum: RolesEnum })
    // @IsNotEmpty()
    // readonly role?: RolesEnum = RolesEnum.USER;

    @ApiProperty({ description: "this is otp object" })
    @IsOptional()
    @Type(() => OtpUserDto)
    otp?: OtpUserDto = {
        otpValue: null,
        expiryTime: null
    }

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    readonly passwordResetTime?: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    readonly refreshToken?: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    readonly refreshTokenCreationTime?: string;

    @ApiPropertyOptional({
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    readonly verified?: boolean = false;

    @ApiProperty({ type: Array(ExchangeUserDto) })
    @IsOptional()
    exchange?: ExchangeUserDto[]
}
