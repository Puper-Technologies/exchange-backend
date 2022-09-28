import { Injectable, NotFoundException } from '@nestjs/common';
import { MyLogger } from '@shared/logger/logger.service';
import { CryptocoinsService } from '@v1/cryptocoins/cryptocoins.service';
import { UsersService } from '@v1/users/users.service';
import { Types } from 'mongoose';
import { WalletDto } from './dto/crypto-wallet.dto';
import { WalletTransaction } from './dto/wallet-transaction.dto';
import { WalletEntity } from './entities/wallet.entity';
import { WalletRepository } from './repositories/wallet.repository';
import { Wallet } from './schema/wallet.schema';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly userService: UsersService,
    private readonly coinsService: CryptocoinsService,
    private readonly logger: MyLogger,
  ) {}

  async createWallet(walletDto: Wallet): Promise<WalletEntity> {
    if (
      (await this.userService.findOne(walletDto.userId)) === null ||
      (await this.coinsService.findCryptoCoinById(walletDto.coinId)) === null
    ) {
      this.logger.error('User Id or Coin Id found Incorrect!');
      throw new NotFoundException('Please check User Id and Coin Id');
    }
    await this.walletRepository.create(walletDto);
    return new WalletEntity();
  }

  async findWalletById(id: string) {
    return this.walletRepository.getWalletById(id);
  }

  async walletTransaction(walletDto: WalletTransaction) : Promise<WalletEntity> {
    const transactionType = walletDto.transactionType;
    if(transactionType.toLowerCase() === 'add') {
      return this.addCrypto(walletDto);
    } else if(transactionType.toLowerCase() === 'deduct') {
      return this.deductCrypto(walletDto);
    } else {
      throw new NotFoundException('Wrong transaction type')
    }
  }

  async deductCrypto(walletDto: WalletTransaction): Promise<WalletEntity> {
    const currentWallet = await this.findWalletById(walletDto.walletId);
    if (
      currentWallet === null 
    ) {
      this.logger.error('Wallet Id found Incorrect!');
      throw new NotFoundException('Please check Wallet Id');
    }
    if(!currentWallet) {
      this.logger.error('Current Wallet is null');
    }
    const currentBalance = currentWallet.balance;
    if(currentBalance < walletDto.amount) {
      throw new NotFoundException(`Deduct transaction failed! userId ${currentWallet.userId} have less balance. Current balance : ${currentBalance} Amount to deducted : ${walletDto.amount}`);
    }
    const deductedWallet = {
      userId : currentWallet.userId,
      coinId : currentWallet.coinId,
      balance: currentBalance - walletDto.amount,
      isActive: currentWallet.isActive
    }
    const count = await this.walletRepository.transactionInWallet(deductedWallet);
    if(count > 0) {
      return deductedWallet;
    } else {
      throw new NotFoundException(`Deduct transaction failed! For walletId ${walletDto.walletId}`)
    }
  }

  async addCrypto(walletDto: WalletTransaction) : Promise<WalletEntity>{
    const currentWallet = await this.findWalletById(walletDto.walletId);
    if (
      currentWallet === null 
    ) {
      this.logger.error('Wallet Id found Incorrect!');
      throw new NotFoundException('Please check Wallet Id');
    }
    const currentBalance = currentWallet.balance;
    const deductedWallet = {
      userId : currentWallet.userId,
      coinId : currentWallet.coinId,
      balance: currentBalance + walletDto.amount,
      isActive: currentWallet.isActive
    }
    const count = await this.walletRepository.transactionInWallet(deductedWallet);
    if(count > 0) {
      return deductedWallet;
    } else {
      throw new NotFoundException(`Deduct transaction failed! For walletId ${walletDto.walletId}`)
    }
  }
}
