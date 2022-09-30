import { Injectable } from "@nestjs/common";
import { TransactionRepository } from "./repositories/transaction.repository";
@Injectable()
export class TransactionService {
    constructor(private readonly transactionRespository: TransactionRepository){}

}