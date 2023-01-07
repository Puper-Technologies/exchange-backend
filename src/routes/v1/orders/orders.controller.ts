import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@ApiTags('order')
@Controller('order')
export class OrdersController {

    constructor(private readonly orderService: OrdersService) {}

    /**
     * Controller method for creating order
     */
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async createOrder(@Body() createOrder: CreateOrderDto){
        return this.orderService.createOrder(createOrder);
    }

    @Delete(':id')
    async deleteOrder(){

    }

    @Get(':id')
    async getOrder(){

    }
}