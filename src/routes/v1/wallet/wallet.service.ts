import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class WalletService {
  constructor() {}

  async addAmountInWallet(
    userId: Types.ObjectId,
    amount: number,
    coinId: Types.ObjectId,
  ) {
    try {
    } catch {}
  }

  async createWallet(userId: Types.ObjectId, balance = 0) {
    try {
    } catch (error) {}
  }

  // delete

  // patch
}
