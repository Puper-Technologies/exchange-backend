import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseInterceptors, HttpCode, HttpStatus, UseFilters, Query, BadRequestException, UseGuards, InternalServerErrorException } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiExtraModels, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse, getSchemaPath  } from "@nestjs/swagger";
import { CreateWalletDto } from "./dto/create-crypto-wallet.dto";
import { WalletEntity } from "./entities/wallet.entity";
import Serialize from '@decorators/serialization.decorator';
import ResponseUtil from '@utils/response.util';
import { WalletService } from "./wallet.service";
import { Types } from "mongoose";

// to be remove in future (all operation must perform by services)
@ApiTags('wallet')
@Controller('wallet')
export class WalletController {

    constructor(private readonly walletService: WalletService) {}
    // adding a wallet for the user
  @ApiBody({ type: CreateWalletDto })
  @ApiOkResponse({
    description: '201, Success',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        message: [
          {
            target: {
              name: 'string',
              symbol: 'string',
            },
            value: 'string',
            property: 'string',
            children: [],
            constraints: {},
          },
        ],
        error: 'Bad Request',
      },
    },
    description: '400. ValidationException',
  })
  @ApiConflictResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '409. ConflictResponse',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        details: {},
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.CREATED)
  @Serialize(WalletEntity)
  @Post()
  async createCryptoWallet(@Body() walletDto: CreateWalletDto) {
    const newWalletDto = {
      ...walletDto,
      userId: new Types.ObjectId(walletDto.userId),
      coinId: new Types.ObjectId(walletDto.coinId),
      isActive: true
    }
    const newWallet = await this.walletService.createWallet(newWalletDto);
    if (!newWallet) {
      throw new NotFoundException('Unable to create new Crypto wallet');
    }

    return ResponseUtil.success(
      'wallet',
      newWallet
    );
  }
}