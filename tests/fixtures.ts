import type { MarketCoin } from "@/types/market";

export function coin(overrides: Partial<MarketCoin> & Pick<MarketCoin, "id">): MarketCoin {
  return {
    symbol: overrides.id.slice(0, 3).toUpperCase(),
    name: overrides.id,
    image: null,
    rank: null,
    price: 1,
    marketCap: 1,
    volume24h: 1,
    change24h: 0,
    change7d: 0,
    ...overrides,
  };
}

export const COINS: MarketCoin[] = [
  coin({ id: "bitcoin", name: "Bitcoin", symbol: "BTC", marketCap: 1000, volume24h: 50, change24h: 1.5, price: 80000, rank: 1 }),
  coin({ id: "ethereum", name: "Ethereum", symbol: "ETH", marketCap: 500, volume24h: 80, change24h: -2, price: 2500, rank: 2 }),
  coin({ id: "solana", name: "Solana", symbol: "SOL", marketCap: 100, volume24h: 20, change24h: 6, price: 150, rank: 3 }),
  coin({ id: "mystery", name: "Mystery", symbol: "MYS", marketCap: null, volume24h: null, change24h: null, price: null }),
];
