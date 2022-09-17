import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class WalletService{
    constructor(){}

    async addAmountInWallet(userId: Types.ObjectId, amount){
         
    }

}