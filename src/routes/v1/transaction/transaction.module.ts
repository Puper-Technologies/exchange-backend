import { Module } from "@nestjs/common";
import { TransactionRepository } from "./repositories/transaction.repository";
import { TransactionService } from "./transaction.service";

@Module({
    imports: [],
    providers: [
        TransactionService, 
        TransactionRepository
    ],
})
export class Transaction {
}