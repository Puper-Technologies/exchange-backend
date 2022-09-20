import { Module } from '@nestjs/common';
import { Routes, RouterModule } from 'nest-router';

import { AuthModule } from '@v1/auth/auth.module';
import { UsersModule } from '@v1/users/users.module';
import { CryptocoinsModule } from './cryptocoins/cryptocoins.module';
import { ExpertCryptocasesModule } from './expert-cryptocase/expert-cryptocase.module';
import { ExchangeModule } from './exchange/exchange.module';
import { MongoModule } from '@resources/database/mongo.module';
// import { CompetitionModule } from './competition/competition.module';

const routes: Routes = [
  {
    path: '/v1',
    children: [
      { path: '/', module: AuthModule },
      { path: '/', module: UsersModule },
      { path: '/', module: CryptocoinsModule },
      { path: '/', module: ExpertCryptocasesModule },
      { path: '/', module: ExchangeModule },
      // { path: '/', module: CompetitionModule },
    ],
  },
];

@Module({
  imports: [ RouterModule.forRoutes(routes), AuthModule, UsersModule, CryptocoinsModule, ExpertCryptocasesModule, ExchangeModule, CompetitionModule, MongoModule.forRoot() ],
})
export default class V1Module {}
