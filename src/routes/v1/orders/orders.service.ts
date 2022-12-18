import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersRepository } from "./repositories/orders.repository";

@Injectable()
export class OrdersService {
    constructor(private readonly ordersRepositoryy: OrdersRepository){
    }

    createOrder(orderData: CreateOrderDto){
        return this.ordersRepositoryy.create(orderData);
    }

    deleteOrder(){

    }

    async getOrderById(_id: Types.ObjectId){
        const order = await this.ordersRepositoryy.getOrderById(_id);
        if(!order)
            throw new NotFoundException(`No Order found for the Id ${_id}`);
        return order;
    }   

    updateOrder(){

    }
}