import { CoinsPair } from '@v1/cryptocoins/schemas/coinspair.schema';
import { Cryptocoin } from '@v1/cryptocoins/schemas/cryptocoin.schema';
import { TransactionEntity } from '@v1/exchange/entities/transaction.entity';
import { CryptoWeight } from '@v1/expert-cryptocase/entities/crypto-weight.entity';
import { ExpertCryptocase } from '@v1/expert-cryptocase/entities/expert-cryptocase.entity';
import { User } from '@v1/users/schemas/user.schema';

// Import all model from entity
export interface PaginatedUsersInterface {
  readonly paginatedResult: User[] | [],
  readonly totalCount: number,
}

export interface PaginatedCryptocoinsInterface {
  readonly paginatedResult: Cryptocoin[] | [],
  readonly totalCount: number,
}

export interface PaginatedCoinsPairInterface {
  readonly paginatedResult: CoinsPair[] | [],
  readonly totalCount: number,
}

export interface PaginatedExpertCryptocaseInterface {
  readonly paginatedResult: ExpertCryptocase[] | [],
  readonly totalCount: number,
}
export interface PaginatedCryptoWeightInterface {
  readonly paginatedResult: CryptoWeight[] | [],
  readonly totalCount: number,
}

export interface PaginatedTransactionInterface {
  readonly paginatedResult: TransactionEntity[] | [],
  readonly totalCount: number,
}