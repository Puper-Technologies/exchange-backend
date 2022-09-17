import { MongoException } from "@filters/mongo-exception.filter";
import { HttpException, Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Error, Model, Types } from "mongoose";
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from "@interfaces/pagination-params.interface";
import { PaginatedCryptocoinsInterface, PaginatedCryptoWeightInterface } from "@interfaces/paginated-users.interface";
import PaginationUtil from '@utils/pagination.util';
import { Competition, CompetitionDocument } from "../schemas/competition.schema";
import { CreateCompetitionDto } from "../dto/create-competition.dto";
import { RewardDto } from "../dto/reward.dto";
import { RewardRepository } from "./reward.repository";
import { CompetitionStatusType } from "@config/constants";
import { UpdateCompetitionDto } from "../dto/update-competition.dto";

@Injectable()
export class CompetitionRepository {
    constructor(
        @InjectModel(Competition.name) private competitionModel: Model<CompetitionDocument>,
        private logger: MyLogger,
 
    ) {
        this.logger.setContext(CompetitionRepository.name);
    }
    

    async addCompetition(competition: Competition){
        try{
            return (await this.competitionModel.create(competition)).toObject();
        }catch(error){
            throw new NotAcceptableException('Not valid request body');
        }
        
    }

    async getCompetitionsByQuery(filter: any, sortQuery: any){
        const competitionData : Object = await this.competitionModel.aggregate([
            {
                $lookup: {
                    from:'participants',
                    localField: '_id',
                    foreignField:'competitionId',
                    as: 'participants'
                }
            },
            {
                $match: filter
            },
            {
                $addFields:{
                    participantCount: { $size: '$participants'}
                }
            },
            {
                $sort: sortQuery
            }
        ]);

        
        return competitionData;
    }

    async getCompetitionById(competitionId: Types.ObjectId){
        try{
            return await this.competitionModel.findById(competitionId)
            .populate('reward')
            .lean();
        }catch(error){
            throw new MongoError(error);
        }
        
    }

    async updateCompetitionStatus(competitionId: Types.ObjectId, status: CompetitionStatusType){
        try {
            return await this.competitionModel.findByIdAndUpdate(competitionId, {status},{new:true}).lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }


    async updateCompetitionById(competitionId: Types.ObjectId, updateCompetitionDto : UpdateCompetitionDto){
        try {
            return await this.competitionModel.findByIdAndUpdate(competitionId, updateCompetitionDto,{ new: true }).lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }

}