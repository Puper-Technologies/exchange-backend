import { CoinsPair } from '@v1/tokens/schemas/coinspair.schema';
import { Cryptocoin } from '@v1/tokens/schemas/token.schema';
import { User } from '@v1/users/schemas/user.schema';

// Import all model from entity
export interface PaginatedUsersInterface {
  readonly paginatedResult: User[] | [];
  readonly totalCount: number;
}

export interface PaginatedCryptocoinsInterface {
  readonly paginatedResult: Cryptocoin[] | [];
  readonly totalCount: number;
}

export interface PaginatedCoinsPairInterface {
  readonly paginatedResult: CoinsPair[] | [];
  readonly totalCount: number;
}

// export interface PaginatedExpertCryptocaseInterface {
//   readonly paginatedResult: ExpertCryptocase[] | [];
//   readonly totalCount: number;
// }
// export interface PaginatedCryptoWeightInterface {
//   readonly paginatedResult: CryptoWeight[] | [];
//   readonly totalCount: number;
// }

// export interface PaginatedTransactionInterface {
//   readonly paginatedResult: TransactionEntity[] | [];
//   readonly totalCount: number;
// }
