import { ExchangeType, OrderStatus } from '@config/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document } from 'mongoose';
/**
 * Schema Type of Order, store orders for sell or buy type
 */
@Schema({timestamps: true})
export class Order {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true
    })
    exchangePair: string;

    @Prop({
        type: Types.ObjectId,
        required: true,
    })
    userId: string;

    @Prop({
        type: SchemaTypes.Number,
        required: true
    })
    limit: number;

    @Prop({
        type: String,
        enum: ExchangeType,
        required: true
    })
    orderType: ExchangeType;

    @Prop({
        type: String,
        enum: OrderStatus,
        required: true,
        default: OrderStatus.INQUEUE
    })
    status: String;

    @Prop({
        type: SchemaTypes.Number,
        required: true
    })
    amount: number;

    @Prop({
        type: SchemaTypes.Number,
        default: 0
    })
    filled?: number;
}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order).set(
  'versionKey',
  false,
);
