import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './user.repository';
import UserDto from './dto/user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { PaginatedUsersInterface } from '@interfaces/paginated-users.interface';
import { MyLogger } from '@shared/logger/logger.service';
import UserResponseEntity from './entities/user-response.entity';
import { AddUserAccountKeyDto } from './dto/user-account-key.dto';
import UsersEntity from './entities/user.entity';
import { SignUpFirebaseDto } from './dto/sign-up-firebase.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import UploadImageS3 from '@utils/upload-s3.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private logger: MyLogger,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async create(userEntity: UsersEntity): Promise<UsersEntity> {
    const newUser: User = userEntity;
    const createdUser = await this.usersRepository.create(newUser);
    return createdUser;
  }

  async findByEmail(email: string) {
    return await this.usersRepository.getByEmail(email);
  }

  async getVerifiedUserById(id: Types.ObjectId) {
    return await this.usersRepository.getVerifiedUserById(id);
  }

  async findOne(id: Types.ObjectId) {
    return await this.usersRepository.getById(id);
  }

  async update(email: string, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.updateUserByEmail(email, updateUserDto);
  }

  // async remove(id: string) {
  //   return await this.usersRepository.deleteById(id)
  // }

  async getUnverifiedUserByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.getUnverifiedUserByEmail(email);
  }

  async deleteTokenByEmail(email: string) {
    return await this.usersRepository.updateUserByEmail(email, {
      refreshToken: null,
    });
  }

  async getUserByMobileNo(mobileNo: string): Promise<User | null> {
    try {
      return await this.usersRepository.getUserByMobileNo(mobileNo);
    } catch (err) {
      throw new NotFoundException(`User Not found with mobile no ${mobileNo}`);
    }
  }

  async getUserByQuery(query: UpdateUserDto): Promise<User | null> {
    return await this.usersRepository.getUserByQuery(query);
  }

  async getUserByQueryModified(query: any): Promise<User | null> {
    return await this.usersRepository.getUserByQueryModified(query);
  }

  public async getAllVerifiedWithPagination(
    options: PaginationParamsInterface,
  ): Promise<PaginatedUsersInterface> {
    return this.usersRepository.getAllVerifiedWithPagination(options);
  }
  /**
   * name
   */
  public async getAllUsersWithPagination(
    options: PaginationParamsInterface,
  ): Promise<PaginatedUsersInterface> {
    return this.usersRepository.getAllUsersWithPagination(options);
  }
  async addUserBinanceAccountKeys(
    addUserAccountKey: AddUserAccountKeyDto,
    exchangeName: string,
  ) {
    const { userId, apiKey, secretKey } = addUserAccountKey;
    const user = (await this.findOne(
      new Types.ObjectId(userId),
    )) as UsersEntity;
    if (user) {
      const inserData = {
        exchangeName,
        apiKey,
        secretKey,
        timestamp: Date.now(),
      };
      try {
        return await this.usersRepository.addUserAccountKey(
          inserData,
          new Types.ObjectId(userId),
        );
      } catch (err) {
        return err;
      }
    }
  }

  async getUserAccountKey(userId: string, exchangeName: string): Promise<any> {
    return await this.usersRepository.getUserAccountKey(
      new Types.ObjectId(userId),
      exchangeName,
    );

    //Need to enhance
    // return data[0]
    // data[0].exchange.map((x) => {
    //   if (x.exchangeName === exchangeName) {
    //     return ({apiKey: x.apiKey})
    //   } else {
    //     return ('hiii')
    //   }
    // })
  }

  // async uploadImage(req: FastifyRequest) {
  //   if (!req.isMultipart()) {
  //     throw new BadRequestException('Request is not multipart');
  //   }
  //   const data = await req.file({ limits: { fileSize: 2e8 } }); // limit upto 200mb of file size
  //   const fileName = data.filename;

  //   // filter image by file type
  //   if (!fileName.match(/\.(jpg|jpeg|png)$/))
  //     throw new BadRequestException('Image expected');

  //   const dataBuffer = await data.toBuffer();

  //   const key = `${fileName.replace(/[^0-9a-zA-Z.]/g, '')}_${
  //     Math.random() * 10e8
  //   }`;
  //   // upload to S3
  //   const uploadedImage = await UploadImageS3.uploadFile(dataBuffer, key);
  //   return uploadedImage;
  // }
}
