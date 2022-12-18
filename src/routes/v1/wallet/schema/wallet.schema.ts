import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// one user will have only one wallet
// on user creation, create wallet
@Schema({ timestamps:true })
export class Wallet {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,
  })
  userId: Types.ObjectId; // owner of this wallet

  @Prop({
    unique: true,
    required: true,
  })
  walletAddress?: string;

  // very sensitive, not to be shared or logged
  // for internal purpose only 
  @Prop({
    type: String,
    required: true,
  })
  pk?: string;

  @Prop({
    type: String,
    required: true,
  })
  mnemonic?: string;

  @Prop({
      type: Boolean,
      required: true,
      default: true
  })
  isActive?: boolean;
}

export type WalletDocument = Wallet & Document;

export const WalletSchema = SchemaFactory.createForClass(Wallet).set(
  'versionKey',
  false,
);

