import { forwardRef, Module } from '@nestjs/common';
import { ExpertCryptocasesService } from './expert-cryptocase.service';
import { ExpertCryptoCaseController } from './expert-cryptocase.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from '@shared/logger/logger.module';
import { ExpertCryptocase, ExpertCryptocaseSchema } from './schemas/expert-cryptocase.schema';
import { CryptoWeight, CryptoWeightSchema } from './schemas/crypto-weight.schema';
import { ExpertCryptocaseRepository } from './repositories/expert-cryptocases.repository';
import { CryptoWeightRepository } from './repositories/crypto-weight.repository';
import { UsersModule } from '@v1/users/users.module';
import { CryptocoinsModule } from '@v1/cryptocoins/cryptocoins.module';
// import { AuthModule } from '@v1/auth/auth.module';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';
import { ExchangeModule } from '@v1/exchange/exchange.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: "This is test secret"
    }),
    MongooseModule.forFeature([
      {
        name: ExpertCryptocase.name,
        schema: ExpertCryptocaseSchema,
      },
      {
        name: CryptoWeight.name,
        schema: CryptoWeightSchema,
      },
    ]),
    LoggerModule,
    UsersModule,
    forwardRef(()=>ExchangeModule),
    CryptocoinsModule
  ],
  controllers: [ExpertCryptoCaseController],
  providers: [ExpertCryptocasesService, ExpertCryptocaseRepository, CryptoWeightRepository,FirebaseAuthService],
  exports: [ExpertCryptocasesService]
})
export class ExpertCryptocasesModule { }
