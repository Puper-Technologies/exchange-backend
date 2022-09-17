import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsMobilePhone } from 'class-validator';



export class LoginAuthDto {
    constructor(body: any | null = null) {
        if (body) {
          this.email = body.email;
          this.password = body.password;
        }
      }

    @ApiProperty({ type: String })
    @IsEmail()
    @IsOptional()
    @MinLength(3)
    @MaxLength(128)
    readonly email: string;

    // @ApiProperty({ type: Number })
    // @IsOptional()
    // @IsMobilePhone()
    // readonly mobileNo: number;

    // @ApiProperty({ type: Boolean })
    // @IsNotEmpty()
    // @IsBoolean()
    // readonly isMobileLogin: boolean = false;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(128)
    readonly password: string;
}