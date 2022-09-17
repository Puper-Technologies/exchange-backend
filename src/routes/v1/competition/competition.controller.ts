import { AuthenticationGuard } from "@guards/authentication.guard";
import RolesGuard from "@guards/roles.guards";
import ResponseWrapInterceptor from "@interceptors/response-wrap.interceptor";
import { Body, Controller, Get, Param,Query, Post, UseGuards, UseInterceptors, Patch, Delete, HttpException, HttpStatus, NotAcceptableException, Response, BadRequestException, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateCompetitionDto } from "./dto/create-competition.dto";
import { CompetitionService } from './competition.service';
import { Roles, RolesEnum } from "@decorators/roles.decorator";
import { CompetitionStatusType, DurationType, ParticipantStatusType, RewardType, SortOrderType } from "@config/constants";
import { CreateParticipantDto } from "./dto/create-participant.dto";
import { ParticipantsService } from "./participants.service";
import { Participant } from "./entities/participant.entity";
import AuthenticatedUser from "@decorators/authenticated-user.decorator";
import UserResponseEntity from "@v1/users/entities/user-response.entity";
import * as lodash from 'lodash';
import ResponseUtil from "@utils/response.util";
import { PaginationParamsInterface } from "@interfaces/pagination-params.interface";
import paginationUtils from "@utils/pagination.util";
import { Types } from "mongoose";
import { UsersService } from "@v1/users/users.service";

import UsersEntity from "@v1/users/entities/user.entity";
import { UpdateParticipantDto } from "./dto/update-participant.dto";



@ApiTags('Competitions')
@ApiBearerAuth()
@UseInterceptors(ResponseWrapInterceptor)
// @UseGuards(AuthenticationGuard)
// @UseGuards(RolesGuard)
@Controller('competitions')
export class CompetitionController {

    constructor(private competitionService : CompetitionService, 
        private participantsService: ParticipantsService,
        private userService: UsersService,
    ){}

    @ApiProperty()
    // @Roles(RolesEnum.ADMIN)
    @Post()
    async addCompetition(@Body() competitionDto : CreateCompetitionDto){
        const competition = await this.competitionService.addCompetition(competitionDto);
        return  ResponseUtil.success('Competition', competition);
    }

    
    // api/v1/competitions?search=name&rewardType=’points’
    // &sortByDate=’asc’&sortByParticipantCount=’asc’&sortByRewardValue=asc 
    @ApiQuery({
        name:'search',
        type: String,
        description:'search by name',
        required:false
    })
    @ApiQuery({
        name:'rewardType',
        type: String,
        enum:RewardType,
        description:'search by reward type',
        required:false
    })
    @ApiQuery({
        name:'status',
        type:String,
        enum:CompetitionStatusType,
        description: "search by competition status - archive, draft, publish, live, ended",
        required:false
    })
    @ApiQuery({
        name:"sortByStartDate",
        type:String,
        enum:SortOrderType,
        description:"sort by start date",
        required:false
    })
    @ApiQuery({
        name:'sortByParticipantCount',
        type:String,
        enum: SortOrderType,
        description:"sort by no. of participant in competition",
        required:false

    })
    @ApiQuery({
        name:'sortByRewardValue',
        type:String,
        enum: SortOrderType,
        description:"sort by reward value",
        required:false

    })
    @ApiQuery({
        name:'sortByDate',
        type:String,
        enum: SortOrderType,
        description:"sort by reward value",
        required:false
    })
    @Get()
    async getCompetitionsByQuery(@Query('search') search: string, 
    @Query('rewardType') rewardType: RewardType,
    @Query('status') status:CompetitionStatusType,
    @Query("sortByStartDate") sortByStartDate: SortOrderType,
    @Query("sortByParticipantCount") sortByParticipantCount: SortOrderType,
    @Query('sortByRewardValue') sortByRewardValue: SortOrderType,
    @Query('sortByDate') sortByDate: SortOrderType
     ){
        return ResponseUtil.success(
            'Competition', 
            await this.competitionService.getCompetitionsByQuery(
                search,
                status,
                rewardType,
                sortByStartDate,
                sortByParticipantCount, 
                sortByDate,
                sortByRewardValue
                )
            ) 
    }
    

/**
 * fetch Competition Document from competitionId
 * @returns Competition 
 */
    @ApiProperty()
    @Get('/:compId')
    async getCompetition(@Param('compId') competitionId: string){
        return ResponseUtil.success('Competition', await this.competitionService.getCompetitionById(competitionId))
    }

    @UseGuards(AuthenticationGuard)
    // @Roles(RolesEnum.ADMIN)
    @Post('participants/:compId')
    async createParticipant(
        @AuthenticatedUser() user: UsersEntity ,
        @Param('compId') competitionId: string ,
        @Body() createParticipantDto : CreateParticipantDto){
            // need to remove this below line to follow authenticated way of enrolling its for temporary
            // const userDetails = await this.userService.getVerifiedUserById(new Types.ObjectId(createParticipantDto.userId))
        return ResponseUtil.success('Participant', await this.participantsService.createParticipant(user, competitionId, createParticipantDto))
    }
    
    // @UseGuards(AuthenticationGuard)
    // @Roles(RolesEnum.ADMIN)
    @Patch('publish/:compId')
    async publishCompetition(@Param('compId') competitionId : string){
        return ResponseUtil.success(
            'competition',
            await this.competitionService.publishCompetitionById(competitionId)
        )
    }

    @UseGuards(AuthenticationGuard)
    @Delete('participants/:participantId')
    async leaveParticipantFromCompetition(
        @AuthenticatedUser() user,
        @Param('participantId') participantId: string){
        const participant: Participant = await this.participantsService.getParticipantById(participantId);

        if(!participant.isUpdateable)
            throw new BadRequestException("Participant is not updateable");

        if(lodash.isEmpty(participant)) 
            throw new HttpException('Invalid participant id',HttpStatus.BAD_REQUEST );
        
        // if user is not  the participant
        if(!participant.userId.equals(user._id.toString()))
            throw new NotAcceptableException('Participants userId does not match with authenticated userId');
        
        return ResponseUtil.success(
            'participant',
            await this.participantsService.updateParticipantById(participantId, { participantStatus:ParticipantStatusType.LEFT })
        )
        
    }

    @Get(`participants/:participantId`)
    async getParticipantById(@Param('participantId') participantId: string) {
        return ResponseUtil.success(
            'participant',
            await this.participantsService.getParticipantById(participantId)
        )
        
    }

    /**
     * sort participants by rank of particiular competition
     * 
     */
    @Get('leaderboard/:compId')
    @ApiQuery({
        name:'page',
        type:String,
        description:"Page no for leaderboard",
        required:false
    })
    @ApiQuery({
        name:'limit',
        type:String,
        description:"per page limit for leaderboard",
        required:false
    })
    async getLeaderboard(@Param('compId') competitionId: string, @Query('page') pageNo: string, @Query('limit') limit: string){
        const pageQuery = {
            number: pageNo,
            limit: "10",
            size: limit || "10"
          }
          const paginationParams: PaginationParamsInterface | false = paginationUtils.normalizeParams(pageQuery);
          if (!paginationParams) {
            throw new BadRequestException('Invalid pagination parameters');
          }
      
          const leaderboardParticipants = await this.participantsService.getLeaderBoard(competitionId, paginationParams)
      
          return ResponseUtil.success(
            'participant',
            leaderboardParticipants,
            // {
            //   location: 'api/v1/cryptocoins',
            //   paginationParams,
            //   totalCount: paginatedUsers.totalCount,
            // },
          );
    }



    // stats
    // 5 min, 30min, 3hr, 6hr, 12hr, 24hr, 24*7 hr 




    @Get('/:compId/participant/:partId/statistics')
    async getStats(@Param('compId') competitionId: string, @Param('partId') participantId: string, @Query('duration') duration: DurationType ){
        
        return ResponseUtil.success('stat',await this.competitionService.getStats(competitionId, participantId, duration))
        // return await this.competitionService.getStats(competitionId, participantId, duration);
    }


    /**
     * Get the participancy of each user
     */
    @UseGuards(AuthenticationGuard)
    @Get('mycompetitions')
    async getMyCompetition (@AuthenticatedUser() user: UsersEntity){
        const participants = await this.participantsService.getMyCompetitions(user._id.toString());
        return ResponseUtil.success('participants',participants);
    }

    @UseGuards(AuthenticationGuard)
    @Patch('participant/:partId')
    async updateParticipantById(@Param('partId') participantId: string,@Body() updateParticipantDto: UpdateParticipantDto){
        // check whether participant exist of the given participant id
        const participant: Participant = await this.participantsService.getParticipantById(participantId);
        // check whether participant object is updateable or not
        if(!participant.isUpdateable)
            throw new BadRequestException('Participants cannot be  updated');
            
        // filter out the required updateParticipantDto to update the fields allowed

        const {
            cryptoCaseRefId
        } = updateParticipantDto;

        const updatedParticipant = await this.participantsService.updateParticipantById(participantId, { cryptoCaseRefId });
        return ResponseUtil.success('Particpant', updatedParticipant);

    }


}