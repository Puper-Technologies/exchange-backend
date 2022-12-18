import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerModule } from "@shared/logger/logger.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { Order, OrderSchema } from "./schemas/order.schema";

@Module({
    imports: [
      MongooseModule.forFeature([
        {
          name: Order.name,
          schema: OrderSchema,
        },
      ]),
      LoggerModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersService],
  })
  export class OrdersModule {}
  