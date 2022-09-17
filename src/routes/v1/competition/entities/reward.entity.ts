import { RewardType } from "@config/constants";
import { RedeemInfo } from "../interfaces/reward.interface";

export class Reward {

    name: string;

    type: RewardType;

    value:{
        minRank: number,
        maxRank: number,
        earning: number
    }[];

    totalValue: number;

    redeemInfo?: RedeemInfo;

}