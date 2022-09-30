import { TransactionType } from "aws-sdk/clients/lakeformation";
import { TransactionStatus } from "aws-sdk/clients/rdsdataservice";

export class TransactionEntity {
    
    from: string;

    to: string; 

    transactionType: TransactionType;
    
    status: TransactionStatus;

    transactionTime: number;

}