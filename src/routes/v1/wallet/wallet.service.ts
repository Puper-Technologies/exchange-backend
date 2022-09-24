import { Injectable, NotFoundException } from "@nestjs/common";
import { MyLogger } from "@shared/logger/logger.service";
import { CryptocoinsService } from "@v1/cryptocoins/cryptocoins.service";
import { UsersService } from "@v1/users/users.service";
import { Types } from "mongoose";
import { CreateWalletDto } from "./dto/create-crypto-wallet.dto";
import { WalletEntity } from "./entities/wallet.entity";
import { WalletRepository } from "./repositories/wallet.repository";
import { Wallet } from "./schema/wallet.schema";

@Injectable()
export class WalletService{
    constructor(private readonly walletRepository: WalletRepository, 
        private readonly userService: UsersService,
        private readonly coinsService: CryptocoinsService,
        private readonly logger: MyLogger){}


    async createWallet( walletDto: Wallet) : Promise<WalletEntity>{
            if(await this.userService.findOne(walletDto.userId) === null || await this.coinsService.findCryptoCoinById(walletDto.coinId) === null) {
                this.logger.error('User Id or Coin Id found Incorrect!');
                throw new NotFoundException('Please check User Id and Coin Id');
            }
            await this.walletRepository.create(walletDto)
            return new WalletEntity();
    }
    

}