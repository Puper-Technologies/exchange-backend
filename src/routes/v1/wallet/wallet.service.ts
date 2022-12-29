import { Injectable, NotFoundException } from '@nestjs/common';
import { MyLogger } from '@shared/logger/logger.service';
import { UsersService } from '@v1/users/users.service';
import { Types } from 'mongoose';
import { WalletDto } from './dto/crypto-wallet.dto';
import { WalletTransaction } from './dto/wallet-transaction.dto';
import { WalletRepository } from './repositories/wallet.repository';
import { Wallet, WalletDocument } from './schema/wallet.schema';
import * as ethers from 'ethers';
@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly userService: UsersService,
    // private readonly coinsService: CryptocoinsService,
    private readonly logger: MyLogger,
  ) {}

  async createWallet(userId: Types.ObjectId, isActive: boolean = true): Promise<Wallet> {
    const user = await this.userService.findOne(userId)
    if (!user) {
      this.logger.error('User Id or Coin Id found Incorrect!');
      throw new NotFoundException('Please check User Id and Coin Id');
    }
    const blockChainWallet = await this.createBlockchainWallet();
    const walletData = {
      userId,
      walletAddress: blockChainWallet.address,
      pk: blockChainWallet.privateKey,
      mnemonic: blockChainWallet.mnemonic.phrase
    }
    return await this.walletRepository.createWallet(walletData);
  }

  async findWalletById(id: string) {
    return this.walletRepository.getWalletById(id);
  }

  // async walletTransaction(walletDto: WalletTransaction) : Promise<Wallet> {
  //   const transactionType = walletDto.transactionType;
  //   if(transactionType.toLowerCase() === 'add') {
  //     return this.addCrypto(walletDto);
  //   } else if(transactionType.toLowerCase() === 'deduct') {
  //     return this.deductCrypto(walletDto);
  //   } else {
  //     throw new NotFoundException('Wrong transaction type')
  //   }
  // }

  // async deductCrypto(walletDto: WalletTransaction): Promise<Wallet> {
  //   const currentWallet = await this.findWalletById(walletDto.walletId);
  //   if (
  //     currentWallet === null 
  //   ) {
  //     this.logger.error('Wallet Id found Incorrect!');
  //     throw new NotFoundException('Please check Wallet Id');
  //   }
  //   if(!currentWallet) {
  //     this.logger.error('Current Wallet is null');
  //   }
  //   const currentBalance = currentWallet.balance;
  //   if(currentBalance < walletDto.amount) {
  //     throw new NotFoundException(`Deduct transaction failed! userId ${currentWallet.userId} have less balance. Current balance : ${currentBalance} Amount to deducted : ${walletDto.amount}`);
  //   }
  //   const deductedWallet = {
  //     userId : currentWallet.userId,
  //     coinId : currentWallet.coinId,
  //     balance: currentBalance - walletDto.amount,
  //     isActive: currentWallet.isActive
  //   }
  //   const count = await this.walletRepository.transactionInWallet(deductedWallet);
  //   if(count > 0) {
  //     return deductedWallet;
  //   } else {
  //     throw new NotFoundException(`Deduct transaction failed! For walletId ${walletDto.walletId}`)
  //   }
  // }

  // async addCrypto(walletDto: WalletTransaction) : Promise<Wallet>{
  //   const currentWallet = await this.findWalletById(walletDto.walletId);
  //   if (
  //     currentWallet === null 
  //   ) {
  //     this.logger.error('Wallet Id found Incorrect!');
  //     throw new NotFoundException('Please check Wallet Id');
  //   }
  //   const currentBalance = currentWallet.balance;
  //   const deductedWallet = {
  //     userId : currentWallet.userId,
  //     coinId : currentWallet.coinId,
  //     balance: currentBalance + walletDto.amount,
  //     isActive: currentWallet.isActive
  //   }
  //   const count = await this.walletRepository.transactionInWallet(deductedWallet);
  //   if(count > 0) {
  //     return deductedWallet;
  //   } else {
  //     throw new NotFoundException(`Deduct transaction failed! For walletId ${walletDto.walletId}`)
  //   }
  // }

  async createBlockchainWallet(){
    const wallet = ethers.Wallet.createRandom();
    return wallet;
  }

}
