import { Injectable, NotFoundException } from "@nestjs/common";
import { MyLogger } from "@shared/logger/logger.service";
import { UsersService } from "@v1/users/users.service";
import { Connection } from "mongoose";
import { CryptoTransferEntity } from "./entities/crypto-transfer-entity";
import { WalletEntity } from "./entities/wallet.entity";
import { WalletRepository } from "./repositories/wallet.repository";
import { Wallet } from "./schema/wallet.schema";
import { WalletBalanceService } from "./wallet-balance.service";

@Injectable()
export class WalletService{
    constructor(private readonly walletRepository: WalletRepository, 
        private readonly userService: UsersService,
        // private readonly walletBalanceService: WalletBalanceService,
        // private readonly connection: Connection,
        private readonly logger: MyLogger){}

    async createWallet( walletDto: Wallet) : Promise<WalletEntity>{
            if(await this.userService.findOne(walletDto.userId) === null) {
                this.logger.error('User Id found Incorrect!');
                throw new NotFoundException('Please check User Id ');
            }
            const wallet = await this.walletRepository.create(walletDto);
            // create ethereum wallet
            
            return wallet;
    }

    // async createCryptoTransfer(cryptoTransferEntity: CryptoTransferEntity){
    //     const session = await this.connection.startSession();
    //     session.startTransaction();   
    //     const { senderWalletId, receiverWalletId, coinId, transferAmount } = cryptoTransferEntity;
    //     try {
    //         // update sender account 
    //         await this.walletBalanceService.debitWalletBalance(senderWalletId, coinId, transferAmount, session );
    //         // update receiver account
    //         await this.walletBalanceService.creditWalletBalance(receiverWalletId, coinId, transferAmount, session);
    //         await session.commitTransaction();
    //     } catch (error) {
    //         await session.abortTransaction();
    //         this.logger.error(`Unexpected error occured while doing transfer of crypto b/w senderWallet ${senderWalletId} reeiverWallet ${receiverWalletId} coinId ${coinId} transferAmount ${transferAmount}`)
    //         throw error;
    //     }
    // }

}