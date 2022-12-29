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
import { WalletBalance, WalletBalanceSchema } from './schema/wallet-balance.schema';
import { EthereumWallet, EthereumWalletSchema } from './schema/eth-wallet.schema';
import { WalletBalanceService } from './wallet-balance.service';
import { WalletBalanceRepository } from './repositories/wallet-balance.repository';
import { EthereumWalletService } from './services/eth-wallet.service';
import { EthereuemWalletRepository } from './repositories/eth-wallet.repository';
import { Web3Service } from 'src/common/services/web3.service';

@Module({
    imports: [
        MongooseModule.forFeature([
          {
            name: Wallet.name,
            schema: WalletSchema,
          },
          {
            name: WalletBalance.name,
            schema: WalletBalanceSchema
          },
          {
            name: EthereumWallet.name,
            schema: EthereumWalletSchema
          }
        ]),
        LoggerModule,
        UsersModule,
        CryptocoinsModule
      ],
      controllers: [WalletController],
      providers: [
        WalletService, 
        WalletRepository,
        WalletBalanceService,
        WalletBalanceRepository,
        EthereumWalletService,
        EthereuemWalletRepository,
        FirebaseAuthService,
        Web3Service
      ],
      exports: [WalletService]
})
export class WalletModule {}
