import { Controller, Delete, Get, Post } from "@nestjs/common";

@Controller('order')
export class OrdersController {

    /**
     * Controller method for creating order
     */
    @Post()
    async createOrder(){

    }

    @Delete(':id')
    async deleteOrder(){

    }

    @Get(':id')
    async getOrder(){

    }
}