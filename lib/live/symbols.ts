import type { LiveSymbolInfo } from "@/types/live";

/**
 * Curated USDT pairs offered for live streaming. CoinGecko and Binance use
 * different identifiers, so the mapping is explicit rather than guessed from
 * tickers (e.g. many CoinGecko assets share a ticker, stablecoins have no USDT pair).
 */
export const LIVE_SYMBOLS: readonly LiveSymbolInfo[] = [
  { symbol: "BTCUSDT", base: "BTC", name: "Bitcoin", coinId: "bitcoin" },
  { symbol: "ETHUSDT", base: "ETH", name: "Ethereum", coinId: "ethereum" },
  { symbol: "SOLUSDT", base: "SOL", name: "Solana", coinId: "solana" },
  { symbol: "BNBUSDT", base: "BNB", name: "BNB", coinId: "binancecoin" },
  { symbol: "XRPUSDT", base: "XRP", name: "XRP", coinId: "ripple" },
  { symbol: "DOGEUSDT", base: "DOGE", name: "Dogecoin", coinId: "dogecoin" },
  { symbol: "ADAUSDT", base: "ADA", name: "Cardano", coinId: "cardano" },
  { symbol: "TRXUSDT", base: "TRX", name: "TRON", coinId: "tron" },
  { symbol: "AVAXUSDT", base: "AVAX", name: "Avalanche", coinId: "avalanche-2" },
  { symbol: "LINKUSDT", base: "LINK", name: "Chainlink", coinId: "chainlink" },
  { symbol: "DOTUSDT", base: "DOT", name: "Polkadot", coinId: "polkadot" },
  { symbol: "LTCUSDT", base: "LTC", name: "Litecoin", coinId: "litecoin" },
];

export const DEFAULT_LIVE_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
export const MAX_LIVE_SYMBOLS = 6;

const bySymbol = new Map(LIVE_SYMBOLS.map((info) => [info.symbol, info]));
const byCoinId = new Map(LIVE_SYMBOLS.map((info) => [info.coinId, info]));

export const isSupportedLiveSymbol = (symbol: string) => bySymbol.has(symbol);
export const getLiveSymbolInfo = (symbol: string) => bySymbol.get(symbol);
export const getLiveSymbolForCoin = (coinId: string) => byCoinId.get(coinId)?.symbol ?? null;
