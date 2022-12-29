import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Web3Service } from 'src/common/services/web3.service';
import { EthereuemWalletRepository } from '../repositories/eth-wallet.repository';

@Injectable()
export class EthereumWalletService {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly ethWalletRepository: EthereuemWalletRepository
        ){
    }
    /**
     * creates ethereum wallet for the wallet
     * @param walletId 
     */
    async createEthWallet(walletId: Types.ObjectId){
        const web3Wallet = await this.web3Service.createWallet();
        const ethWallet = await this.ethWalletRepository.createEthereumWallet(walletId, web3Wallet);
        return ethWallet;
    }

    async getEthWalletByWalletId(walletId: Types.ObjectId){
        const ethWallet = await this.ethWalletRepository.getEthWalletByWalletId(walletId);
        if(!ethWallet)
            throw new NotFoundException(`No EthWallet found for the wallet ${walletId}`);
        return ethWallet;
    }

    getEthWalletByAddress(address:string){

    }
}