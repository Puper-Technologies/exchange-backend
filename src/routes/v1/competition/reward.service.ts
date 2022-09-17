import { Injectable } from "@nestjs/common";
import { RewardDto } from "./dto/reward.dto";
import { RewardRepository } from "./repositories/reward.repository";

@Injectable()
export class RewardService {
    constructor(private rewardRepository: RewardRepository){

    }

    async addReward(rewardDto : RewardDto){
        return await this.rewardRepository.addReward(rewardDto);
    }
}