import { Types, Model, Error, set } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';

// import SignUpDto from '@v1/auth/dto/sign-up.dto';
import { UserDocument, User } from './schemas/user.schema';
// import { MongoException } from '@filters/mongo-exception.filter';
import { MongoError } from 'mongodb';
import UpdateUserDto from './dto/update-user.dto';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { PaginatedUsersInterface } from '@interfaces/paginated-users.interface';
import PaginationUtils from '@utils/pagination.util';
import { MyLogger } from '@shared/logger/logger.service';
import UserResponseEntity from './entities/user-response.entity';
import { AddUserAccountKeyDto } from './dto/user-account-key.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private logger: MyLogger
  ) {
    this.logger.setContext(UsersRepository.name);
  }

  public async create(user: User) {
    try {
      const newUser = await this.usersModel.create({
        ...user,
        verified: false,
      });

      this.logger.log(`Successfully created a new user in db ${newUser}`);
      return newUser.toObject();

    } catch (error) {
      this.logger.error(`Unexpected error while creating new user ${JSON.stringify(user)} due to ${error.message}`)
      throw new MongoError(error);
    }
  }

  public async getByEmail(email: string): Promise<User | null> {
    try {
      const foundUser = await this.usersModel
        .findOne({
          email,
        })
        .lean();

      this.logger.log(`Successfully found user in db ${foundUser}`);
      return foundUser
    } catch (error) {
      this.logger.error(`Unexpected error while searching user ${email} due to ${error.message}`);
      throw new MongoError(error);
    }
  }

  public async getVerifiedUserByEmail(email: string): Promise<User | null> {
    try {
      const foundUser = await this.usersModel
      .findOne({
        email,
        verified: true,
      })
      .lean();

      this.logger.log(`Successfully found verified user in db ${foundUser.email}`);
      return foundUser
    } catch (error) {
      throw new ServiceUnavailableException(`Unexpected error while searching verified user ${email} due to ${error.message}`);
    }
  }

  public async getUnverifiedUserByEmail(email: string): Promise<User | null> {
    try {
      const foundUser = await this.usersModel
      .findOne({
        email,
        verified: false,
      })
      .lean();

      this.logger.log(`Successfully found unverified user in db ${foundUser}`);
      return foundUser
    } catch (error) {
      throw new ServiceUnavailableException(`Unexpected error while searching unverified user ${email} due to ${error.message}`);
    }
  }

  public async getById(id: Types.ObjectId): Promise<User | null> {
    try {
      const foundUser = await this.usersModel
      .findOne(
        {
          _id: id,
        },
        { password: 0 },
      )
      .lean();

      this.logger.log(`Successfully found user by Id in db ${foundUser._id}`);
      return foundUser
    } catch (error) {
      throw new ServiceUnavailableException(`Unexpected error while searching user with id ${id} due to ${error.message}`);
    }
  }

  public async getUserByQuery(query: UpdateUserDto): Promise<User | null> {
    try {
      const foundUser = await this.usersModel
      .findOne(
        query,
        { password: 0 },
      )
      .lean();

      this.logger.log(`Successfully found user by query in db ${JSON.stringify(query)}`);
      return foundUser
    } catch (error) {
      this.logger.error(`Unexpected error while searching user with query ${JSON.stringify(query)} due to ${error.message}`);
      throw new MongoError(error);
    }
  }

  public async getUserByQueryModified(query : any ): Promise<User | null> {
    try {
      const foundUser = await this.usersModel
      .findOne(
        query,
        { password: 0 },
      )
      .lean();

      this.logger.log(`Successfully found user by query in db ${JSON.stringify(query)}`);
      return foundUser
    } catch (error) {
      this.logger.error(`Unexpected error while searching user with query ${JSON.stringify(query)} due to ${error.message}`);
      throw new MongoError(error);
    }
  }

  public async getVerifiedUserById(id: Types.ObjectId): Promise<User | null> {
    return this.usersModel
      .findOne(
        {
          _id: id,
          verified: true,
        },
        { password: 0 },
      )
      .lean();
  }

  public async getUnverifiedUserById(id: Types.ObjectId): Promise<User | null> {
    return this.usersModel
      .findOne(
        {
          _id: id,
          verified: false,
        },
        { password: 0 },
      )
      .lean();
  }

  public async getUserByMobileNo(mobileNo: string): Promise<User | null> {
    
    return await this.usersModel
      .findOne(
        {
          mobileNo: mobileNo
        }
      )
      .lean();
  }

  public async updateUserByEmail(email: string, data: UpdateUserDto): Promise<User | null> {
    try {
      const updatedUser =  await this.usersModel
        .findOneAndUpdate({
          email
        },
          {
            $set: data,
          },
          { upsert: true }
        ).lean();

        this.logger.log(`Successfully updated the user ${email} with data ${JSON.stringify(data)}`)
        return updatedUser
    } catch (error) {
      throw new InternalServerErrorException(`Unexpected error occured in updating db value due to ${error.message}`);
    }

  }


  public async getAllVerifiedWithPagination(options: PaginationParamsInterface): Promise<PaginatedUsersInterface> {
    const verified = true;
    const [users, totalCount] = await Promise.all([
      this.usersModel.find({
        verified,
      }, {
        password: 0,
      })
        .limit(PaginationUtils.getLimitCount(options.limit))
        .skip(PaginationUtils.getSkipCount(options.page, options.limit))
        .lean(),
      this.usersModel.count({ verified })
        .lean(),
    ]);

    return { paginatedResult: users, totalCount };
  }

  /**
   * name
   */
  public async getAllUsersWithPagination(options: PaginationParamsInterface): Promise<PaginatedUsersInterface> {
    const [users, totalCount] = await Promise.all([
      this.usersModel.find({
      }, {
        password: 0,
      })
        .limit(PaginationUtils.getLimitCount(options.limit))
        .skip(PaginationUtils.getSkipCount(options.page, options.limit))
        .lean(),
      this.usersModel.count({})
        .lean(),
    ]);

    return { paginatedResult: users, totalCount };
  }
  async addUserAccountKey(exchange: any, userId:Types.ObjectId){
    const updated_user = await this.usersModel.updateOne({_id: userId}, {$push: {exchange: exchange}}).lean()
    return updated_user;
  }

  async getUserAccountKey(userId: Types.ObjectId, exchangeName: string) {
    return await this.usersModel.find({_id: userId}, {_id: 0,exchange: { $elemMatch :{ exchangeName: exchangeName}}}).lean()
  }
}
