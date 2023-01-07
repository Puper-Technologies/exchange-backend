import { Module } from '@nestjs/common';
import { Routes, RouterModule } from 'nest-router';
import { AuthModule } from '@v1/auth/auth.module';
import { UsersModule } from '@v1/users/users.module';
import { CryptocoinsModule } from './tokens/cryptocoins.module';
import { MongoModule } from '@resources/database/mongo.module';
import { OrdersModule } from './orders/orders.module';

const routes: Routes = [
  {
    path: '/v1',
    children: [
      { path: '/', module: AuthModule },
      { path: '/', module: UsersModule },
      { path: '/', module: CryptocoinsModule },
      { path: '/', module: OrdersModule },
      // { path: '/', module: ExchangeModule },
      // { path: '/', module: CompetitionModule },
    ],
  },
];

@Module({
  imports: [
    RouterModule.forRoutes(routes),
    AuthModule,
    UsersModule,
    CryptocoinsModule,
    OrdersModule,
    MongoModule.forRoot(),
  ],
})
export default class V1Module { }
