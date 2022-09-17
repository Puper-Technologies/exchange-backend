import { Module } from '@nestjs/common';
import { CryptocoinsService } from './cryptocoins.service';
import { CryptocoinsController } from './cryptocoins.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Cryptocoin, CryptocoinSchema } from './schemas/cryptocoin.schema';
import { LoggerModule } from '@shared/logger/logger.module';
import { CryptocoinRepository } from './repositories/cryptocoins.repository';
import { CoinsPairRepository } from './repositories/coinspair.repository';
import { CoinsPair, CoinsPairSchema } from './schemas/coinspair.schema';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';
import { UsersModule } from '@v1/users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: "This is test secret"
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Cryptocoin.name,
        schema: CryptocoinSchema,
      },
      {
        name: CoinsPair.name,
        schema: CoinsPairSchema,
      },
    ]),
    LoggerModule,
    UsersModule
  ],
  controllers: [CryptocoinsController],
  providers: [CryptocoinsService, CryptocoinRepository, CoinsPairRepository,FirebaseAuthService],
  exports: [CryptocoinsService]
})
export class CryptocoinsModule {}
