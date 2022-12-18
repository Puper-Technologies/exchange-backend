import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MyLogger } from '@shared/logger/logger.service';
import { Error, Model, Types } from 'mongoose';
import { MongoError } from 'mongodb';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { PaginatedCryptocoinsInterface } from '@interfaces/paginated-users.interface';
import PaginationUtil from '@utils/pagination.util';
import { Order, OrderDocument } from '../schemas/order.schema';
@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private logger: MyLogger,
  ) {
    this.logger.setContext(OrdersRepository.name);
  }

  public async create(order: Partial<Order>): Promise<Order> {
    try {
      const newOrder = await this.orderModel.create({
        ...order,
      });

      this.logger.log(
        `Successfully created a new order in db ${newOrder}`,
      );
      return newOrder.toObject();
    } catch (error) {
      this.logger.error(
        `Unexpected error while creating new order ${JSON.stringify(
          order,
        )} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }


  public async getOrderById(id: Types.ObjectId): Promise<Order | null> {
    try {
      const order = await this.orderModel.findById(id).lean();
      this.logger.log(
        `Successfully found order with id ${order} from db`,
      );
      return order;
    } catch (error) {
      this.logger.error(
        `Unexpected error while searching crypto coin with id ${id} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }

  public async getByIds(ids: string[]): Promise<Order[] | null> {
    try {
      const order = await this.orderModel
        .find({
          _id: { $in: ids },
        })
        .lean();

      this.logger.log(
        `Successfully found multiple orders with ids ${order.length} from db`,
      );
      return order;
    } catch (error) {
      this.logger.error(
        `Unexpected error while searching crypto coin with id ${ids} due to ${error.message}`,
      );
      throw new MongoError(error);
    }
  }

//   public async getBySymbol(symbol: string): Promise<order | null> {
//     try {
//       const order = await this.orderModel
//         .findOne({
//           symbol,
//         })
//         .lean();

//       this.logger.log(`Successfully found order in db ${order.name}`);
//       return cryptocoin;
//     } catch (error) {
//       this.logger.error(
//         `Unexpected error while searching for cryptocoin ${symbol} due to ${error.message}`,
//       );
//       throw new MongoError(error);
//     }
//   }

//   public async getAllCryptocoinsWithPagination(
//     query: any,
//     options: PaginationParamsInterface,
//   ): Promise<PaginatedCryptocoinsInterface> {
//     try {
//       console.log(query);
//       const [cryptocoin, totalCount] = await Promise.all([
//         this.orderModel
//           .find(query)
//           .sort({ cmcRank: 1 })
//           .skip(PaginationUtil.getSkipCount(options.page, options.limit))
//           .limit(PaginationUtil.getLimitCount(options.limit))
//           .lean(),
//         this.orderModel.count().lean(),
//       ]);

//       this.logger.log(
//         `Successfully found the list of cryptocoins from db ${totalCount}`,
//       );
//       return { paginatedResult: cryptocoin, totalCount };
//     } catch (error) {
//       this.logger.error(
//         `Unexpected error while listing crypto coin from db due to ${error.message}`,
//       );
//       throw new MongoError(error);
//     }
//   }
}
