import { MongoException } from "@filters/mongo-exception.filter";
import { HttpException, Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Error, Model, Types } from "mongoose";
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from "@interfaces/pagination-params.interface";
import { PaginatedCryptocoinsInterface, PaginatedCryptoWeightInterface } from "@interfaces/paginated-users.interface";
import PaginationUtil from '@utils/pagination.util';
import { Reward, RewardDocument } from "../schemas/reward.schema";
import { RewardDto } from "../dto/reward.dto";

@Injectable()
export class RewardRepository {
    constructor(
        @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
        private logger: MyLogger
    ) {
        this.logger.setContext(RewardRepository.name);
    }
    
    async addReward(reward: RewardDto) {
        try {
            const newReward = await this.rewardModel.create(reward);
            return newReward.toObject();
        } catch (error) {
            throw new MongoError(error);
        }

    }
}