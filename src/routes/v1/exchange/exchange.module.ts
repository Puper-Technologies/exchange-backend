import { forwardRef, Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { LoggerModule } from '@shared/logger/logger.module';
import { UsersModule } from '@v1/users/users.module';
import { HttpModule } from '@nestjs/axios';
import ExchangeRepository from './repositories/exchange.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpertCryptocasesModule } from '@v1/expert-cryptocase/expert-cryptocase.module';
import { CryptocoinsModule } from '@v1/cryptocoins/cryptocoins.module';
import { AuthModule } from '@v1/auth/auth.module';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';

@Module({
  imports: [
    LoggerModule,
    UsersModule,
    forwardRef(()=>ExpertCryptocasesModule),
    CryptocoinsModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
    ]),
  ],
  providers: [TransactionRepository, ExchangeService, ExchangeRepository, FirebaseAuthService],
  controllers: [ExchangeController],
  exports: [ExchangeService]
})
export class ExchangeModule {}
