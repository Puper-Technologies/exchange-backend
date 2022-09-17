import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class Cryptocoin {
    // @ApiProperty({ type: String })
  // _id?: Types.ObjectId = new Types.ObjectId();

  @ApiProperty({ type: String})
  name;

  @ApiProperty({ type: Number})
  rank?;

  @ApiProperty({ type: String })
  symbol;

  @ApiProperty({ type: String })
  slug;

  @ApiProperty({ type: String })
  description;

  @ApiProperty({ type: Array})
  marketCap;

  @ApiProperty({ type: Number})
  isActive;

  @ApiProperty({ type: Number})
  cmcId;

  @ApiProperty({ type: String })
  logo;

  @ApiProperty({ type: Number})
  cmcRank; 

  @ApiProperty({ type: Number})
  circulatingSupply;

  @ApiProperty({ type: Number})
  totalSupply;

  @ApiProperty({ type: Array }) 
  tags;

  @ApiProperty({ type: Date })
  dateLaunched;

  @ApiProperty({ type: String })
  category; 

  @ApiProperty({ type: Array })
  website;
}
