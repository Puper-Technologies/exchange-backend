import { Injectable } from "@nestjs/common";
import { ClientSession, Types } from "mongoose";
import { WalletBalanceRepository } from "./repositories/wallet-balance.repository";

@Injectable()
export class WalletBalanceService {
    constructor(private readonly walletBalanceRepository: WalletBalanceRepository){}

    async creditWalletBalance(walletId: Types.ObjectId, coinId: Types.ObjectId, txnAmount: number, session: ClientSession){
        return await this.walletBalanceRepository.updateWalletBalance(walletId, coinId, txnAmount, session);
    }
    
    async debitWalletBalance(walletId: Types.ObjectId, coinId: Types.ObjectId, txnAmount: number, session: ClientSession){
        return await this.walletBalanceRepository.updateWalletBalance(walletId, coinId, -txnAmount, session);
    }
}