import { RewardType, SortOrderType, SortOrder, CompetitionStatusType, Platform, Duration, DurationType } from "@config/constants";
import { BadRequestException, HttpException, HttpStatus, Injectable, NotAcceptableException } from "@nestjs/common";
import { CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Types } from "mongoose";
import { CreateCompetitionDto } from "./dto/create-competition.dto";
import { CompetitionRepository } from "./repositories/competition.repository";
import { RewardService } from "./reward.service";
import { Competition } from "./entities/competition.entity";
import { MyLogger } from "@shared/logger/logger.service";
import { ExchangeService } from "@v1/exchange/exchange.service";
import { CurrentPrice } from "@v1/exchange/entities/current-price.entity";
import { ParticipantsService } from "./participants.service";
import { ExpertCryptocasesService } from "@v1/expert-cryptocase/expert-cryptocase.service";
import { ExpertCryptocase } from "@v1/expert-cryptocase/entities/expert-cryptocase.entity";
import { Participant } from "./entities/participant.entity";
import * as lodash from 'lodash';
import { CompetitionPriceHistoryService } from "./competition-price-history.service";
import { UpdateParticipantDto } from "./dto/update-participant.dto";
import { FastifyReply, FastifyRequest } from "fastify";
import UploadImageS3 from "@utils/upload-s3.service";
import { UpdateCompetitionDto } from "./dto/update-competition.dto";
import { Reward } from "./entities/reward.entity";
import  { startSession } from 'mongoose';

@Injectable()
export class CompetitionService {
    
    constructor(private competitionRepository: CompetitionRepository,
        private readonly rewardService: RewardService,
        private readonly scheduleRegistry: SchedulerRegistry,
        private readonly exchangeService: ExchangeService,
        private readonly participantsService: ParticipantsService,
        private readonly expertCryptocasesService: ExpertCryptocasesService,
        private readonly compPriceHistoryService: CompetitionPriceHistoryService,
        private readonly logger: MyLogger){
            this.logger.setContext(CompetitionService.name);
    }

    compare(participantPerformanceA, participantPerformanceB){
        if(participantPerformanceA.gain>participantPerformanceB.gain)
            return -1;

        if(participantPerformanceA.gain<participantPerformanceB.gain) 
            return 1;

        return 0;
        
    }

    async getIntervalSymbolPrice(exchange: Platform= Platform.BINANCE): Promise<any> {
        const symbolPrice = {};
        const symbolsTickerData: CurrentPrice[] = await this.exchangeService.getAllSymbolCurrentPrice(exchange);
        symbolsTickerData.forEach((symbolTicker)=>symbolPrice[symbolTicker.symbol]=symbolTicker.price)
        return symbolPrice;
    }


    async sortByGainAndUpdate(participantsPerformace: any[]){
        const sortedParticipants = participantsPerformace.sort(this.compare);
        let position = 0;
        let prevRank = 0;
        let prevCurrentCaseValue = -1;
        return await Promise.all(sortedParticipants.map(async (participantPerformace)=>{
            position++;
            let updateParticipantDto: UpdateParticipantDto;
            if(!prevRank){
                prevRank = position;
                prevCurrentCaseValue = participantPerformace.currentCaseValue;
                updateParticipantDto = {   // change dto to performance
                    performance: {
                        rank: position,
                        gain: participantPerformace.gain,
                        currentCaseValue: participantPerformace.currentCaseValue
                    }
                }
            }
            else if(prevCurrentCaseValue === participantPerformace.currentCaseValue)
            {
                updateParticipantDto = {
                    performance: {
                        rank:prevRank,
                        gain: participantPerformace.gain,
                        currentCaseValue: participantPerformace.currentCaseValue
                    }
                }
            }else{
                prevRank = position;
                prevCurrentCaseValue = participantPerformace.currentCaseValue;
                updateParticipantDto = {
                        performance: {
                        rank: position,
                        gain: participantPerformace.gain,
                        currentCaseValue: participantPerformace.currentCaseValue
                    }
                }
            }
            
            return await this.participantsService.updateParticipantById(participantPerformace.participantId.toString(), updateParticipantDto);
            
        })

        )
    }

    getCaseValue(initialSymbolQty: any, symbolsData: any ){
        let currentCaseValue = 0;
        Object.keys(initialSymbolQty).forEach((symbol)=>{
            currentCaseValue += symbolsData[symbol]*initialSymbolQty[symbol]
        })
        return currentCaseValue;
    }

    async scheduleCompetition(competition: Competition){
       /**
        * call exchange api at regular interval and update the performance of every participants
        */
       //CronExpression.EVERY_10_MINUTES
        const intervalJob = new CronJob(CronExpression.EVERY_5_SECONDS, async ()=>{
            
            
            const symbolsData = await this.getIntervalSymbolPrice();
            // const await this.exchangeService.getAllSymbolCurrentPrice('binance');
            const { priceHistory } = await this.compPriceHistoryService.addIntervalSymsbolsPrice(competition._id.toString(), symbolsData);
            // update current gain, rank , cryptocasevalue of each participants
            
            const participants: Participant[] = await this.participantsService.findActiveParticipantsByCompetitionId(competition._id.toString());
            const participantsPerformance = participants.map((participant: Participant)=>{
                // let currentCaseValue = 0;
                // Object.keys(participant.initialSymbolQty).forEach((symbol)=>{
                //     currentCaseValue += symbolsData[symbol]*participant.initialSymbolQty[symbol]
                // })
                let currentCaseValue = this.getCaseValue(participant.initialSymbolQty,symbolsData)
                const gain = ((currentCaseValue-competition.investmentAmount)*100)/competition.investmentAmount;
                return { participantId: participant._id, gain, currentCaseValue };
                // await this.participantsService.updateParticipantById(participant._id.toString(), {performance:{currentCaseValue, gain: ((currentCaseValue-competition.investmentAmount)*100)/competition.investmentAmount}})
                
            })


            // console.log(participantsPerformance);
            await this.sortByGainAndUpdate(participantsPerformance);

        })


        
        this.scheduleRegistry.addCronJob(`${competition._id.toString()}-interval`,intervalJob);
        competition.startDate = new Date(Date.now()+30*1000)
        const onStartCompetition = new CronJob(competition.startDate,async ()=>{
            this.logger.log(`competition started`)
            // change status of competition from publish to live
            const updatedCompetition = await this.updateCompetitionById(competition._id,{ status: CompetitionStatusType.LIVE } );

            const symbolsData = await this.getIntervalSymbolPrice();
            // update competitionPriceHistory by adding current all symbols price
            const {priceHistory} = await this.compPriceHistoryService.addIntervalSymsbolsPrice(competition._id.toString(),symbolsData);
            // allot quantiy for participants cryptocoins
            const initialSymbolsPrice = symbolsData;

            const participants: Participant[] = await this.participantsService.findActiveParticipantsByCompetitionId(competition._id.toString());
            participants.forEach(async (participant: Participant)=>{
                const initialSymbolQty = {};
                console.log('cryptocase detail', participant.cryptoCaseDetail)
                const quoteSymbol = participant.cryptoCaseDetail.quoteSymbol;

                participant.cryptoCaseDetail.cryptoWeightageList.forEach((cryptoweight)=>{
                    const coinPairSymbol = cryptoweight.cryptoCoin.symbol+quoteSymbol
                    initialSymbolQty[coinPairSymbol] = (competition.investmentAmount*cryptoweight.currentPercentage)/(initialSymbolsPrice[coinPairSymbol]*100)
                    
                })
                
                await this.participantsService.updateParticipantById(participant._id.toString(), { initialSymbolQty })
            })
            intervalJob.start();
            onEndCompetition.start();
       })
       
       this.scheduleRegistry.addCronJob(`${competition._id.toString()}-start`,onStartCompetition);
       onStartCompetition.start();

       
       /**
        *   before one hour of start of competition clone all the cryptocase  in participant &
            Set `isUpdateable` = `false`  
            
            new Date(competition.startDate.getTime()-Duration[DurationType.ONE_HR])
        */
       const beforeOneHourOfStart = new CronJob( new Date(competition.startDate.getTime()),async ()=>{
        // fetch all the active participant of the competition from competitonId
            const participants: Participant[] = await this.participantsService.findActiveParticipantsByCompetitionId(competition._id.toString());
            this.logger.log(`the list of  participants for competitionId ${competition._id}`, participants);
        
        // iterate through all participant and clone cryptocase data in cryptocase which is populated , set isUpdateable to false
        await Promise.all(participants.map(async (participant)=>{
            const cryptoCaseId = participant.cryptoCaseRefId as Types.ObjectId;
            const cryptoCaseDetail = await this.expertCryptocasesService.findCryptocaseById(cryptoCaseId);
            return await this.participantsService.updateParticipantById(participant._id.toString(), { isUpdateable: false, cryptoCaseDetail } )
        }));

       })

       beforeOneHourOfStart.start();
       this.scheduleRegistry.addCronJob(`${competition._id.toString()}-beforeOneHourOfstart`,beforeOneHourOfStart);


       //competition.endDate
       const onEndCompetition = new CronJob(new Date(Date.now()+90*1000),async ()=>{
        // update competition status
        const endedCompetition = await this.competitionRepository.updateCompetitionStatus(competition._id, CompetitionStatusType.ENDED) as Competition;
        
        // const session = await startSession();
        try{
        // get participants sorted with rank
        const participants: Participant[] = await this.participantsService.getParticipantsSortedWithRank(competition._id);
        this.logger.log('participant sorted with rank', participants)
        const reward: Reward = competition.reward;
        // let i = 0;
        // reward.value.map( async ({ minRank, maxRank, earning })=>{
        //     while(i<participants.length){
        //         const participant = participants[i] as Participant;
        //         if(participant.performance.rank > maxRank)
        //             break;
        //         if(participant.performance.rank<=maxRank && participant.performance.rank>=minRank)
        //         {
        //             // update reward of participant
        //             await this.participantsService.updateParticipantById(participant._id.toString(), { reward:{
        //                 value:earning,
        //                 type:'points',
        //                 expiry: new Date(Date.now()+Duration["24hr"]*365)
        //             }})
        //         }

        //         i++;
        //     }
        // })
            await Promise.all(
                participants.map(async (participant)=>{
                    await Promise.all(
                        reward.value.map(async ({ minRank,maxRank,earning })=>{

                            const {performance:{ rank }} = participant ;
                            let updatedReward;
                            if(rank>=minRank && rank <=maxRank) 
                                updatedReward = {
                                    value: earning,
                                    rewardType:RewardType.POINTS,
                                    expiry :new Date(Date.now()+Duration["24hr"]*365)
                                } 
                            else
                            {
                                updatedReward = {
                                    value: 0,
                                    rewardType: RewardType.POINTS,
                                    expiry: new Date(Date.now()+Duration["24hr"]*365)
                                }
                            }
                            await this.participantsService.updateParticipantById(participant._id.toString(),{ reward: updatedReward })
                        })
                    )

                })
            );



            
            // await session.commitTransaction();
            this.logger.log(`competition ${competition._id} ended and rewards updated`);
                
        }catch(err){
            // await session.abortTransaction();
            console.log(err);
            this.logger.error('error occured while rewarding participants')
        }
        finally{
            //  session.endSession();
        }
        
        
        onStartCompetition.stop();
        intervalJob.stop();
        console.log("interval job stopped")
        onEndCompetition.stop();
        this.scheduleRegistry.deleteCronJob(`${competition._id.toString()}-interval`)
        this.scheduleRegistry.deleteCronJob(`${competition._id.toString()}-beforeOneHourOfstart`);
        this.scheduleRegistry.deleteCronJob(`${competition._id.toString()}-start`)
        this.scheduleRegistry.deleteCronJob(`${competition._id.toString()}-end`)
    })
    this.scheduleRegistry.addCronJob(`${competition._id.toString()}-end`,onEndCompetition);
       
    }

    async addCompetition(competitionDto: CreateCompetitionDto){
        // const { _id } = await this.rewardService.addReward(competitionDto.reward);

        
        const newCompetition = {
            name: competitionDto.name,
            userId: new Types.ObjectId(competitionDto.userId),
            maxParticipants: competitionDto.maxParticipants,
            startDate: competitionDto.startDate,
            endDate: competitionDto.endDate,
            status: competitionDto.status,    // bug detected
            investmentAmount: competitionDto.investmentAmount,
            reward: competitionDto.reward,
            logo: competitionDto.logo,
            imageUrl: competitionDto.imageUrl
        }

        const competition  =  await this.competitionRepository.addCompetition(newCompetition) as Competition;
        const compPriceHistory = await this.compPriceHistoryService.createPriceHistoryByCompId(competition._id);
        return competition;
    }

    async getCompetitionsByQuery(search: string,status: CompetitionStatusType, rewardType: RewardType, sortByStartDate: SortOrderType, sortByParticipantCount: SortOrderType,sortByDate:SortOrderType, sortByRewardValue?: SortOrderType){
        const filter: any = {}
        const sortQuery: any = {}
        
        search?filter['name'] = { $regex: search, $options:'i'}:null;
        status?filter['status'] = status:null;
        rewardType?filter['reward.type'] = rewardType: null;

        sortByStartDate?sortQuery['startDate'] = SortOrder[sortByStartDate]: null;
        sortByParticipantCount?sortQuery['participantCount'] = SortOrder[sortByParticipantCount]: null;

        if(sortByDate)
        {
          sortQuery.createdAt = SortOrder[sortByDate]
        }else 
        sortQuery.createdAt = SortOrder['desc'];  // newly added cryptocase by default 

        return await this.competitionRepository.getCompetitionsByQuery(filter, sortQuery);
    }

    async getCompetitionById(competitionId: string){
        const competition=  await this.competitionRepository.getCompetitionById(new Types.ObjectId(competitionId)) as Competition;
        return competition;
    }


    async updateCompetitionById(competitionId, updateCompetitionDto: UpdateCompetitionDto){
        return await this.competitionRepository.updateCompetitionById(new Types.ObjectId(competitionId), updateCompetitionDto);
    }

    async publishCompetitionById(competitionId: string){
        // make condition here 
        const competition = await this.competitionRepository.getCompetitionById(new Types.ObjectId(competitionId)) as Competition;
        // add validation here
        if(lodash.isEmpty(competition))
            throw new BadRequestException("No competition exist of the given Id");

        // if(competition.status !== CompetitionStatusType.DRAFT)
        //     throw new BadRequestException("Only publish draft competition");

        // if(competition.startDate >=competition.endDate)
        //      throw new BadRequestException('Competition cannot have enddate before startdate');
        
        // if(competition.startDate.getTime() < ( Date.now() + Duration["3hr"]/2))
        //     throw new BadRequestException('competition must publish at least 1.5 hr before start Time')
        
        const publishedCompetition  = await this.competitionRepository.updateCompetitionStatus(new Types.ObjectId(competitionId), CompetitionStatusType.PUBLISH) as Competition;
        this.logger.log(`Competition with Id: ${competition._id.toString()} get published`);
        
        
        await this.scheduleCompetition(publishedCompetition);
        return publishedCompetition;
    }


    // async updateParticipantsPerformance(competition: Competition){
    //     /** find gain of the participants****/
        
        
    //     // find all the participants of given competitionId 
    //     // first find all the symbol of cryptocase
    //     // 

    //     const participants = await this.participantsService.findActiveParticipantsByCompetitionId(competition._id.toString()) as Participant[];
    //     const initialSymbolsPrice = competition.intervalSymbolPrice[0];
    //     const currentSymbolPrice = competition.intervalSymbolPrice.slice(-1)[0];
        
    //     participants.forEach(async (participant: Participant )=>{
    //         const cryptocase = participant.cryptoCase as ExpertCryptocase;
            
    //     })

    // }

/**
 * takes competitionPriceHistory and date in Time format and return the date closest to provided 
 * time
 * @param competitionPriceHistory 
 * @param date 
 * @returns the symboldData object closest to the provided date
 */
     getClosestDate(competitionPriceHistory, date: number) {
        const { priceHistory } = competitionPriceHistory;
        const closest = priceHistory.reduce((prev, curr) => {
          return (Math.abs(curr.epochTime.getTime() - date) < Math.abs(prev.epochTime - date) ? curr : prev);
        });
        return closest;
    }

    async getStats(competitionId: string, participantId: string, duration: DurationType){
        // const compPriceHistory = await this.compPriceHistoryService.getPriceHistoryByCompId(competitionId);
        
        const participant: Participant = await this.participantsService.getParticipantById(participantId);
        const compPriceHistory = await this.compPriceHistoryService.getPriceHistoryByCompId(participant.competition.toString());
        // get current price data 
       
        const currentSymbolsData = compPriceHistory.priceHistory.slice(-1)[0];
         //filter the past price details 
        const pastPriceDetails: any = this.getClosestDate(compPriceHistory, currentSymbolsData.epochTime.getTime()- Duration[duration]);
        // now we have the symbols price data and we need to calculate the cryptocase value at that time, i.e pastCaseValue
        const pastCaseValue = this.getCaseValue(participant.initialSymbolQty, pastPriceDetails.symbolsData);
        // get price data for the time
        this.logger.log(`currrent case value is ${participant.performance.currentCaseValue}`)
        return {
            gainValue: participant.performance.currentCaseValue-pastCaseValue,
            gainPercentage: ((participant.performance.currentCaseValue - pastCaseValue)*100)/pastCaseValue
        }


    }




}