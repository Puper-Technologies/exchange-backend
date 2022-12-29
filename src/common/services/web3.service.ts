import { Injectable } from "@nestjs/common";
import Web3 from 'web3';

@Injectable()
export class Web3Service {
    
    provider: string;
    web3: Web3;
    constructor(){
        console.log(Web3)
        this.provider = '';
        this.web3 = new Web3(Web3.givenProvider);
    }
    /**
     * create new ethereum wallet 
     * @returns ethereum wallet
     */
    async createWallet(){
        const { address, privateKey } = await this.web3.eth.accounts.create();
        return {
            address,
            privateKey
        }
    }

}