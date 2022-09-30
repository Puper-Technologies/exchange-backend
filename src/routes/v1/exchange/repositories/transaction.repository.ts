import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MyLogger } from '@shared/logger/logger.service';
import { Model, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../schemas/exchange.schema';
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { PaginatedTransactionInterface } from '@interfaces/paginated-users.interface';
import PaginationUtil from '@utils/pagination.util';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private logger: MyLogger,
  ) {
    this.logger.setContext(TransactionRepository.name);
  }

  public async createNewUserTransaction(transaction: Transaction) {
    try {
      const newUserTransaction = await this.transactionModel.create({
        ...transaction,
      });

      this.logger.log(
        `Successfully created a new crypto transaction by user ${transaction.userId} ${newUserTransaction._id} in db`,
      );
      return newUserTransaction.toObject();
    } catch (error) {
      this.logger.error(
        `Unexpected error while creating new transaction ${JSON.stringify(
          transaction,
        )} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }

  public async getById(id: Types.ObjectId): Promise<Transaction | null> {
    try {
      const userTransactions = await this.transactionModel.findById(id).lean();

      this.logger.log(
        `Successfully found crypto transaction with id ${userTransactions._id} from db`,
      );
      return userTransactions;
    } catch (error) {
      this.logger.error(
        `Unexpected error while searching for crypto transaction made by user ${id} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }

  public async getUserTransactionList(
    platform: string,
    userId: Types.ObjectId,
    options: PaginationParamsInterface,
  ) {
    try {
      const [userTransactions, totalCount] = await Promise.all([
        this.transactionModel
          .find({ userId: userId, platform: platform })
          .limit(PaginationUtil.getLimitCount(options.limit))
          .skip(PaginationUtil.getSkipCount(options.page, options.limit))
          .lean(),
        this.transactionModel.find({ userId: userId }).count().lean(),
      ]);

      this.logger.log(
        `Successfully found the list of crypto portfolio from db ${totalCount}`,
      );
      return { paginatedResult: userTransactions, totalCount };
    } catch (error) {
      this.logger.error(
        `Unexpected error while listing crypto portfolio from db due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }
}
