/** Binance `<symbol>@miniTicker` payload (all numbers are strings upstream). */
export interface BinanceMiniTicker {
  e: "24hrMiniTicker";
  /** Event time (ms). */
  E: number;
  s: string;
  /** Close (last) price. */
  c: string;
  /** Open price 24h ago. */
  o: string;
  h: string;
  l: string;
}

export interface LiveTicker {
  symbol: string;
  price: number;
  open24h: number;
  high24h: number;
  low24h: number;
  /** Percentage change vs. 24h open. */
  change24h: number;
  eventTime: number;
}

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface LiveSymbolInfo {
  /** Binance pair, e.g. BTCUSDT. */
  symbol: string;
  base: string;
  name: string;
  /** Matching CoinGecko id, used to link to the asset page. */
  coinId: string;
}
