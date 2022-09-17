import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';
import { LoggerModule } from '@shared/logger/logger.module';
import { ExchangeModule } from '@v1/exchange/exchange.module';
import { ExpertCryptocasesModule } from '@v1/expert-cryptocase/expert-cryptocase.module';
import { UsersModule } from '@v1/users/users.module';
import { CompetitionPriceHistoryService } from './competition-price-history.service';
import { CompetitionController } from './competition.controller';
import { CompetitionService } from './competition.service';
import { ParticipantsService } from './participants.service';
import { CompetitionPriceHistoryRepo } from './repositories/competition-price-history.repository';
import { CompetitionRepository } from './repositories/competition.repository';
import { ParticipantsRepository } from './repositories/participant.repository';
import { RewardRepository } from './repositories/reward.repository';
import { RewardService } from './reward.service';
import { CompetitionPriceHistory, CompetitionPriceHistorySchema } from './schemas/competition-price-history.schema';
import { Competition, CompetitionSchema } from './schemas/competition.schema';
import { Participant, ParticipantSchema } from './schemas/participant.schema';
import { Reward, RewardSchema } from './schemas/reward.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
              name: Competition.name,
              schema: CompetitionSchema,
            },
            {
              name: Participant.name,
              schema: ParticipantSchema,
            },
            {
                name: Reward.name,
                schema: RewardSchema,
            },
            {
              name: CompetitionPriceHistory.name,
              schema: CompetitionPriceHistorySchema
            }
          ]),
          UsersModule,
          LoggerModule,
          ExchangeModule,
          ExpertCryptocasesModule
    ],
    controllers: [ CompetitionController ],
    providers: [ 
      CompetitionService, 
      RewardService,
      ParticipantsService, 
      CompetitionRepository, 
      RewardRepository,
      ParticipantsRepository,
      FirebaseAuthService,
      CompetitionPriceHistoryRepo,
      CompetitionPriceHistoryService
    ]
})
export class CompetitionModule {}
