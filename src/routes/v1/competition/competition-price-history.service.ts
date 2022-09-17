import { Platform } from "@config/constants";
import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CurrentPrice } from "@v1/exchange/entities/current-price.entity";
import { ExchangeService } from "@v1/exchange/exchange.service";
import { Types } from "mongoose";
import { CompetitionPriceHistoryRepo } from "./repositories/competition-price-history.repository";
import * as lodash from 'lodash'

@Injectable()
export  class CompetitionPriceHistoryService {
    constructor(private readonly competitionPriceHistoryRepo: CompetitionPriceHistoryRepo, 
        private readonly exchangeService: ExchangeService){}

    async createPriceHistoryByCompId(competitionId: Types.ObjectId){
        return await this.competitionPriceHistoryRepo.createPriceHistory({competitionId})
    }

    // async getIntervalSymbolPrice(exchange: Platform): Promise<any> {
    //     const symbolPrice = {};
    //     const symbolsTickerData: CurrentPrice[] = await this.exchangeService.getAllSymbolCurrentPrice(exchange);
    //     symbolsTickerData.forEach((symbolTicker)=>symbolPrice[symbolTicker.symbol]=symbolTicker.price)
    //     return symbolPrice;
    // }

    async addIntervalSymsbolsPrice(competitionId: string, symbolsData: any){
        const competitionPriceHistory = await this.competitionPriceHistoryRepo.getPriceHistoryByCompetitionId(new Types.ObjectId(competitionId));
        
        if(lodash.isEmpty(competitionPriceHistory))
            throw new HttpException('Invalid competition ID', HttpStatus.NOT_FOUND);
        
        // const allSymbolPrice = await this.getIntervalSymbolPrice(competitionPriceHistory.exchange);
        return await this.competitionPriceHistoryRepo.addCurrentPriceDetailsByCompId(new Types.ObjectId(competitionId),{
            epochTime: new  Date(Date.now()),
            symbolsData: symbolsData
        })
    }

    async getPriceHistoryByCompId(competitionId: string){
        const compPriceHistory = await this.competitionPriceHistoryRepo.getPriceHistoryByCompetitionId(new Types.ObjectId(competitionId));
        if(lodash.isEmpty(compPriceHistory))
            throw new NotFoundException('no competition price history present for the competition id');
        return compPriceHistory;
    }
    
}


