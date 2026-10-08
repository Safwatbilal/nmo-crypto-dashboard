/**
 * Raw CoinGecko v3 response shapes — only the fields we read.
 * Everything is typed as nullable/optional because the public API omits or
 * nulls fields for small or newly listed assets.
 */

type Maybe<T> = T | null | undefined;
type CurrencyMap = Maybe<Record<string, Maybe<number>>>;
type CurrencyDateMap = Maybe<Record<string, Maybe<string>>>;

export interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: Maybe<string>;
  current_price: Maybe<number>;
  market_cap: Maybe<number>;
  market_cap_rank: Maybe<number>;
  total_volume: Maybe<number>;
  price_change_percentage_24h: Maybe<number>;
  price_change_percentage_7d_in_currency?: Maybe<number>;
}

export interface CoinGeckoGlobal {
  data: {
    active_cryptocurrencies: Maybe<number>;
    total_market_cap: CurrencyMap;
    total_volume: CurrencyMap;
    market_cap_percentage: CurrencyMap;
    market_cap_change_percentage_24h_usd: Maybe<number>;
  };
}

export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: Maybe<number>;
  categories: Maybe<Maybe<string>[]>;
  genesis_date: Maybe<string>;
  hashing_algorithm: Maybe<string>;
  last_updated: Maybe<string>;
  description: Maybe<{ en?: Maybe<string> }>;
  links: Maybe<{
    homepage?: Maybe<Maybe<string>[]>;
    blockchain_site?: Maybe<Maybe<string>[]>;
  }>;
  image: Maybe<{ thumb?: Maybe<string>; small?: Maybe<string>; large?: Maybe<string> }>;
  market_data: Maybe<{
    current_price: CurrencyMap;
    market_cap: CurrencyMap;
    fully_diluted_valuation: CurrencyMap;
    total_volume: CurrencyMap;
    high_24h: CurrencyMap;
    low_24h: CurrencyMap;
    ath: CurrencyMap;
    ath_date: CurrencyDateMap;
    atl: CurrencyMap;
    atl_date: CurrencyDateMap;
    price_change_percentage_24h: Maybe<number>;
    price_change_percentage_7d: Maybe<number>;
    price_change_percentage_30d: Maybe<number>;
    price_change_percentage_1y: Maybe<number>;
    circulating_supply: Maybe<number>;
    total_supply: Maybe<number>;
    max_supply: Maybe<number>;
    last_updated: Maybe<string>;
    sparkline_7d: Maybe<{ price?: Maybe<Maybe<number>[]> }>;
  }>;
}
