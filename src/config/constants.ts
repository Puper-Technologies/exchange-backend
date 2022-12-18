enum WeightingScheme {
  EQUI_WEIGHTED = 'equally',
  CUSTOM_WEIGHTED = 'custom',
}

enum DomainType {
  COINS = 'coins',
  DEFI = 'defi',
  NFT = 'nft',
  METAVERSE = 'metaverse',
  TOKEN = 'tokens',
}

enum CryptoWeightState {
  NEW = 'New',
  LOCKED = 'Locked',
  UNLOCKED = 'Unlocked',
  REMOVED = 'Removed',
}

const jwt = {
  secret: 'rahulh@dummykey',
  expirationTime: {
    accessToken: '1d',
    refreshToken: '1d',
  },
  secrets: {
    accessToken:
      process.env.ACCESS_TOKEN ||
      '283f01ccce922bcc2399e7f8ded981285963cec349daba382eb633c1b3a5f282',
    refreshToken:
      process.env.REFRESH_TOKEN ||
      'c15476aec025be7a094f97aac6eba4f69268e706e603f9e1ec4d815396318c86',
  },
};

const commonConstants = {
  pagination: {
    defaultLimit: 100,
  },
};

// export const platform = {
//   BINANCE: 'binance',
// };

export enum QUOTE_SYMBOL {
  USDT = 'USDT',
  BUSD = 'BUSD',
  BNB = 'BNB',
}

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  NONE = 'none',
}

export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export enum Platform {
  BINANCE = 'binance',
  COINDCX = 'coindcx',
}

export const CRYPTO_DATA = {
  binance: {
    BASE_URL: 'https://api.binance.com',
    HEADER_API_KEY: 'x-mbx-apiKey',
    HEADER_SECRET_KEY: 'x-mbx-signature',
    EXCHANGE_INFO: '/api/v3/exchangeInfo',
    SYMBOL_24HR_PRICE_STATS: '/api/v3/ticker/24hr',
    SYMBOL_CURRENT_PRICE: '/api/v3/ticker/price',
    ACCOUNT_INFO: '/api/v3/account',
    NEW_ORDER: '/api/v3/order',
  },
  coindcx: {
    BASE_URL: 'https://api.coindcx.com',
    HEADER_API_KEY: 'X-AUTH-APIKEY',
    HEADER_SECRET_KEY: 'X-AUTH-SIGNATURE',
    EXCHANGE_INFO: '/exchange/v1/markets_details',
    SYMBOL_24HR_PRICE_STATS: '/exchange/ticker',
    SYMBOL_CURRENT_PRICE: '/market_data/trade_history',
    ACCOUNT_INFO: '/exchange/v1/users/balances',
    USER_INFO: '/exchange/v1/users/info',
    MARKET_DETAILS: '/exchange/v1/markets_details',
    NEW_ORDER: '/exchange/v1/orders/create',
    MULTIPLE_NEW_ORDER: '/exchange/v1/orders/create_multiple',
  },
};

export const SignInProvider = {
  PHONE: 'phone',
  GOOGLE: 'google.com',
};

export const ExchangeHistoryData = {
  BASE_URL: 'https://api.cryptowat.ch',
  periods: {
    '1m': 60,
    '3m': 180,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '1h': 3600,
    '2h': 7200,
    '4h': 14400,
    '6h': 21600,
    '12h': 43200,
    '1d': 86400,
    '3d': 259200,
    '1w': 604800,
  },
};

enum Period {
  ONE_MINUTE = '1m',
  TWO_MINUTE = '3m',
  FIVE_MINUTE = '5m',
  FIFTEEN_MINUTE = '15m',
  THIRTY_MINUTE = '30m',
  ONE_HOUR = '1h',
  TWO_HOUR = '2h',
  FOUR_HOUR = '4h',
  SIX_HOUR = '6h',
  TWELVE_HOUR = '12h',
  ONE_DAY = '1d',
  THREE_DAY = '3d',
  ONE_WEEK = '1w',
}

export const SortOrder = {
  asc: 1,
  desc: -1,
};

enum SortOrderType {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

enum RewardType {
  CASH = 'cash',
  POINTS = 'points',
  VOUCHERS = 'vouchers',
  CRYPTOS = 'cryptos',
}

enum ParticipantStatusType {
  LEFT = 'left',
  ACTIVE = 'active',
}

enum CompetitionStatusType {
  DRAFT = 'draft',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  LIVE = 'live',
  ENDED = 'ended',
}

export const Duration = {
  '5m': 5 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1hr': 60 * 60 * 1000,
  '3hr': 3 * 60 * 60 * 1000,
  '6hr': 6 * 60 * 60 * 1000,
  '12hr': 12 * 60 * 60 * 1000,
  '24hr': 24 * 60 * 60 * 1000,
  '1week': 7 * 24 * 60 * 60 * 1000,
};

enum DurationType {
  FIVE_MIN = '5m',
  THIRTY_MIN = '30m',
  ONE_HR = '1hr',
  THREE_HRS = '3HR',
  SIX_HRS = '6hr',
  TWELVE_HRS = '12hr',
  TWENTY_FOUR_HRS = '24hr',
  ONE_WEEK = '1week',
}

export {
  jwt,
  commonConstants,
  DurationType,
  WeightingScheme,
  CompetitionStatusType,
  RewardType,
  ParticipantStatusType,
  CryptoWeightState,
  CryptocaseType,
  Period,
  DomainType,
  VolatilityType,
  SortOrderType,
};
