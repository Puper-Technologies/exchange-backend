import { ExchangeType, OrderStatus } from "@config/constants";
import { HttpService } from "@nestjs/axios";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { lastValueFrom, map } from "rxjs";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersRepository } from "./repositories/orders.repository";

@Injectable()
export class OrdersService {
    constructor(private readonly ordersRepositoryy: OrdersRepository, 
        private readonly httpService: HttpService) {
    }

    async createOrder(orderData: CreateOrderDto){
        const newOrder = await this.ordersRepositoryy.create(orderData)
        const obj = {
            RequestId: newOrder._id,
            limitPrice: newOrder.limit,
            pairSymbol: newOrder.exchangePair,
            Cryptos: newOrder.amount,
            buyOrSell: newOrder.orderType === ExchangeType.BUY
        }
        const data = await lastValueFrom(
            this.httpService.post('http://localhost:8080/javaapi/', obj).pipe(
                map(resp => resp.data)
            )
        )
        data.forEach(element => {
            if(element.buyCryptoRemaining === 0) {
                this.updateOrder(element.buyId, OrderStatus.COMPLETED, element.buyCryptoRemaining);
            } else {
                this.updateOrder(element.buyId, OrderStatus.INQUEUE, element.buyCryptoRemaining);
            }
            
            if(element.sellCryptoRemaining === 0) {
                this.updateOrder(element.sellId, OrderStatus.COMPLETED, element.sellCryptoRemaining);
            } else {
                this.updateOrder(element.sellId, OrderStatus.INQUEUE, element.sellCryptoRemaining);
            }
        });
        console.log(data);
        return data;
    }

    deleteOrder(){

    }

    async getOrderById(_id: Types.ObjectId){
        const order = await this.ordersRepositoryy.getOrderById(_id);
        if(!order)
            throw new NotFoundException(`No Order found for the Id ${_id}`);
        return order;
    }   

    async updateOrder(orderId: String, status: OrderStatus, filled: number){
        this.ordersRepositoryy.updateOrder(orderId, status, filled);
    }
}