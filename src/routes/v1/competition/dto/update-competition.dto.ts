import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { Competition } from "../schemas/competition.schema";
import { CreateCompetitionDto } from "./create-competition.dto";

export class UpdateCompetitionDto extends PartialType(CreateCompetitionDto){

    @ApiProperty({
        type:[],
        description:'interval price of symbol at given epoc time'
    })
    intervalSymbolPrice?:Array<any>;
}