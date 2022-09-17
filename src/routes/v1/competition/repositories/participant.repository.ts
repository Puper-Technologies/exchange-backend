import { MongoException } from "@filters/mongo-exception.filter";
import { HttpException, Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MyLogger } from "@shared/logger/logger.service";
import { Error, Model, Types } from "mongoose";
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from "@interfaces/pagination-params.interface";
import { PaginatedCryptocoinsInterface, PaginatedCryptoWeightInterface } from "@interfaces/paginated-users.interface";
import PaginationUtil from '@utils/pagination.util';

import { Participant, ParticipantDocument } from "../schemas/participant.schema";
import { ParticipantStatusType, SortOrder } from "@config/constants";
import { UpdateParticipantDto } from "../dto/update-participant.dto";

@Injectable()
export class ParticipantsRepository {
    constructor(
        @InjectModel(Participant.name) private participantsModel: Model<ParticipantDocument>,
        private logger: MyLogger,
 
    ) {
        this.logger.setContext(ParticipantsRepository.name);
    }
    
    async createParticipant(newParticipant : Participant ){
        try {
            return (await this.participantsModel.create(newParticipant)).toObject();
        } catch (error) {
            throw new MongoError(error);
        }
    }

    async getParticipantById(participantId: Types.ObjectId ): Promise<Participant|null>{
        try {
            return await this.participantsModel.findById(participantId).lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }

    async findActiveParticipantsByCompetitionId(competitionId: Types.ObjectId): Promise<Participant[] |null> {
        try {
            return await this.participantsModel
            .find({ competition: competitionId, participantStatus: ParticipantStatusType.ACTIVE})
            .lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }

    async getLeaderboard(competitionId: Types.ObjectId, options: PaginationParamsInterface){
        try {
            return await this.participantsModel
            .find({ competition: competitionId, participantStatus: ParticipantStatusType.ACTIVE})
            .sort({ 'performance.rank' : SortOrder.asc })
            .skip(PaginationUtil.getSkipCount(options.page,options.limit))
            .limit(PaginationUtil.getLimitCount(options.limit))
            .lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }


    /**
     * 
     * @param competitionId 
     * @returns return the list of active participant of competition sort with rank
     */
    async getParticipantsSortedWithRank(competitionId: Types.ObjectId) {
        try {
            return await this.participantsModel
            .find({competition: competitionId, participantStatus: ParticipantStatusType.ACTIVE })
            .sort({'performance.rank': SortOrder.asc})
            .lean();

        } catch (error) {
            throw new MongoError(error);
        }
    }

    async updateParticipantById(participantId: Types.ObjectId, updateParticipantDto: any): Promise<any>{
        try {
            return await this.participantsModel.findByIdAndUpdate(participantId, updateParticipantDto, {new: true})
            .lean();
        } catch (error) {
            throw new MongoError(error)
        }
    }

    /**
     * Currently being used in transaction for updating rewards of  participant
     * @param participantId 
     * @param updateParticipantDto 
     * @param session 
     * @returns updated document of participant
     */
    async updateActiveParticipantById(participantId: Types.ObjectId, updateParticipantDto: UpdateParticipantDto, session:any): Promise<Participant|null>{
        try {
            return await this.participantsModel.findByIdAndUpdate(participantId, updateParticipantDto, {new: true})
            .session(session)
            .lean();
        } catch (error) {
            throw new MongoError(error)
        }
    }

    async getParticipantsCountOfCompetition(competitionId: Types.ObjectId): Promise<number | null> {
        try {
            return this.participantsModel.find({competitionId}).count();
        } catch (error) {
            throw new MongoError(error);
        }
    }


    async getParticipantsByUserId(userId: Types.ObjectId){
        try {
            const participants: any = await this.participantsModel
            .find({userId})
            .populate('competition')
            .sort({createdAt: SortOrder.desc})
            .lean();

            return participants;
        } catch (error) {
            throw new MongoError(error);
        }
    }
}