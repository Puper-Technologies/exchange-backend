import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Transaction, TransactionDocument } from "../schemas/transaction.schema";
@Injectable()
export class TransactionRepository {
    constructor(@InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>){}

    async createTransaction(){
    }

    async updateTransaction(){
        
    }

    
}