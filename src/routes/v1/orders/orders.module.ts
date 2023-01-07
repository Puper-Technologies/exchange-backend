import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerModule } from "@shared/logger/logger.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { OrdersRepository } from "./repositories/orders.repository";
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
      HttpModule
    ],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersRepository],
  })
  export class OrdersModule {}
  