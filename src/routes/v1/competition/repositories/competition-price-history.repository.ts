import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CompetitionPriceHistory, CompetitionPriceHistoryDocument } from "../schemas/competition-price-history.schema";
import { Competition } from "../schemas/competition.schema";
import { MongoError } from 'mongodb';
@Injectable()
export class CompetitionPriceHistoryRepo {
    constructor(@InjectModel(CompetitionPriceHistory.name) private readonly compPriceHistoryModel: Model<CompetitionPriceHistoryDocument> ){}
    
    /**
     * create new Competition Price history object 
     * @param compPriceHistoryDto 
     * @returns `Promise<CompetitionPriceHistory>`
     */
    async createPriceHistory(compPriceHistoryDto: CompetitionPriceHistory): Promise<CompetitionPriceHistory|null> {
        try {
            const compPriceHistory = await this.compPriceHistoryModel.create(compPriceHistoryDto);
            return compPriceHistory.toObject();
        } catch (error) {
            throw new MongoError(error);
        }
    }

    async updatePriceHistoryByCompetitionId(competitionId: Types.ObjectId, updatePriceHistoryDto): Promise<CompetitionPriceHistory| null>{
        try {
            return await this.compPriceHistoryModel.findOne({ competitionId }, updatePriceHistoryDto,{ new: true }).lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }



    /**
     * return competition Price history for the given competition id
     * @param competitionId 
     * @returns `Promise<CompetitionPriceHistory|null>`
     */
    async getPriceHistoryByCompetitionId(competitionId: Types.ObjectId): Promise<CompetitionPriceHistory |null> {
        try {
            return await this.compPriceHistoryModel.findOne({competitionId}).lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }

    async addCurrentPriceDetailsByCompId(competitionId: Types.ObjectId, currentSymbolPriceDetails ): Promise<CompetitionPriceHistory| null> {
        try {
            return await this.compPriceHistoryModel.findOneAndUpdate({ competitionId }, { $push: {
                priceHistory: currentSymbolPriceDetails
            }}, 
            { new: true })
            .lean();
        } catch (error) {
            throw new MongoError(error);
        }
    }

}