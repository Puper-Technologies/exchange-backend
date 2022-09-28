import { Types } from "mongoose";

export class WalletEntity {

    _id ?: Types.ObjectId;

    userId : Types.ObjectId; 
    
    coinId : Types.ObjectId;
    
    balance : number;

}