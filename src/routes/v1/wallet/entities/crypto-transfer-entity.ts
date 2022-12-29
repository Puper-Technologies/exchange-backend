import { Types } from "mongoose";

export class CryptoTransferEntity {
    senderWalletId: Types.ObjectId;
    
    receiverWalletId: Types.ObjectId;

    coinId: Types.ObjectId;

    transferAmount: number;
}