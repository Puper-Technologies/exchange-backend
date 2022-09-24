import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './schema/wallet.schema';
import { LoggerModule } from '@shared/logger/logger.module';
import { UsersModule } from '@v1/users/users.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletRepository } from './repositories/wallet.repository';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';
import { CryptocoinsModule } from '@v1/cryptocoins/cryptocoins.module';

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
            name: Wallet.name,
            schema: WalletSchema,
          }
        ]),
        LoggerModule,
        UsersModule,
        CryptocoinsModule
      ],
      controllers: [WalletController],
      providers: [WalletService, WalletRepository,FirebaseAuthService],
      exports: [WalletService]
})
export class WalletModule {}
