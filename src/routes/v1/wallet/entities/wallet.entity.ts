import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class WalletEntity {
  userId: Types.ObjectId; // owner of this wallet

  isActive: boolean;

  walletAddress?: string;

  pk?: string;

  mnemonic?: string;
}
