import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class AddUserAccountKeyDto {

    @ApiProperty({ type: String})
    userId: string;

    @ApiProperty({ type: String})
    apiKey: string;

    @ApiProperty({ type: String})
    secretKey: string;
}