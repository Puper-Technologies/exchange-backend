import { CompetitionStatusType, ParticipantStatusType } from "@config/constants";
import { PaginationParamsInterface } from "@interfaces/pagination-params.interface";
import { forwardRef, HttpException, HttpStatus, Inject, Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { UsersService } from "@v1/users/users.service";
import { Types } from "mongoose";
import { CompetitionService } from "./competition.service";
import { CreateParticipantDto } from "./dto/create-participant.dto";
import { UpdateParticipantDto } from "./dto/update-participant.dto";
import { Competition } from "./entities/competition.entity";
import { Participant } from "./entities/participant.entity";
import { ParticipantsRepository } from "./repositories/participant.repository";
// import { Participant } from "./schemas/participant.schema";

@Injectable()
export class ParticipantsService {
    constructor(private readonly participantsRepository: ParticipantsRepository,
        @Inject(forwardRef(()=>CompetitionService))
        private readonly competitionService: CompetitionService, 
        private readonly userService: UsersService){
    }

    async createParticipant(user, competitionId: string , createParticipantDto : CreateParticipantDto){

        // const {userId} = createParticipantDto;
        // get competition by id 
        // const user = await this.userService.getVerifiedUserById(new Types.ObjectId(userId)); // take user detail from token
        const competition: Competition = await this.competitionService.getCompetitionById(competitionId);
        
        if(competition.status !== CompetitionStatusType.PUBLISH)
            throw new NotAcceptableException(`cannot enroll participant when competition is ${competition.status}`);
        
        // get no. of participant of the given competition
        const numberOfParticipants = await this.participantsRepository.getParticipantsCountOfCompetition(new Types.ObjectId(competitionId));
        
        if(numberOfParticipants === competition.maxParticipants)
            throw new HttpException('Slots are full', HttpStatus.FORBIDDEN);

        const newParticipant = {
            competition: new Types.ObjectId(competitionId),
            userFullName : user.name,
            cryptoCaseRefId: createParticipantDto.cryptoCaseRefId,
            // performance: createParticipantDto.performance,
            enrollDate: new Date(),
            participantStatus: ParticipantStatusType.ACTIVE,
            userId: new Types.ObjectId(user._id),
            userEmail: user.email,
            investedPoints: competition.investmentAmount
        }
        return await this.participantsRepository.createParticipant(newParticipant);
    }

    /**
     * 
     * @param participantId Participant Object Id
     * @returns return the participant of the Id provided. If no participant found, throws NotFoundException
     */
    async getParticipantById(participantId: string): Promise<Participant | null> {
        const participant: Participant = await this.participantsRepository.getParticipantById(new Types.ObjectId(participantId));
        if(!participant)
            throw new NotFoundException('Participant Not found');

        return participant;
    }

    async findActiveParticipantsByCompetitionId(competitionId: string){
        return await this.participantsRepository.findActiveParticipantsByCompetitionId(new Types.ObjectId(competitionId));
    }

    /**
     * 
     * @param participantId Participant Id
     * @param updateParticipantDto 
     * @returns update participant by its id, if  no object found then throw `NotFoundException` error
     */
    async updateParticipantById(participantId: string, updateParticipantDto : any): Promise<Participant | null >{
        
        const updatedParticipant = await this.participantsRepository.updateParticipantById(new Types.ObjectId(participantId), updateParticipantDto) as Participant;
        if(!updatedParticipant)
            throw new NotFoundException('Participant not found');
        return updatedParticipant;
    }

    async updateActiveParticipantById(participantId:string, updateParticipantDto: UpdateParticipantDto,session:any){
        return await this.participantsRepository.updateActiveParticipantById(new Types.ObjectId(participantId), updateParticipantDto,session);
    }

    async getLeaderBoard(competitionId: string,options:PaginationParamsInterface){
        return await this.participantsRepository.getLeaderboard(new Types.ObjectId(competitionId), options);
    }


    /**
     * Returns the list of competition along with their participant data  user participated in.
     */

    async getMyCompetitions(userId: string){
        const participants: any = await this.participantsRepository.getParticipantsByUserId(new Types.ObjectId(userId));
        return participants;
    }

    /**
     * 
     * @param compId CompetitionId
     * @returns return Active Participants sorted with their rank
     */
    async getParticipantsSortedWithRank(compId: Types.ObjectId){
        return await this.participantsRepository.getParticipantsSortedWithRank(compId);
    }
}   