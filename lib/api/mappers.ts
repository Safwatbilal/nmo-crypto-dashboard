import type { CoinGeckoCoin, CoinGeckoGlobal, CoinGeckoMarket } from "@/types/coingecko";
import type { AssetDetail, GlobalStats, MarketCoin, PricePoint } from "@/types/market";

/** Normalises `undefined`/`NaN`/non-numbers to `null`. */
export function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function usd(map: Record<string, number | null | undefined> | null | undefined): number | null {
  return num(map?.usd);
}

function firstLink(links: (string | null | undefined)[] | null | undefined): string | null {
  const link = links?.map(str).find((value) => value?.startsWith("https://"));
  return link ?? null;
}

/** CoinGecko descriptions contain raw HTML anchors; keep plain text only. */
export function toPlainText(html: string | null | undefined, maxLength = 900): string | null {
  const text = str(html?.replace(/<[^>]*>/g, "").replace(/\s+/g, " "));
  if (!text) return null;
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function mapMarketCoin(raw: CoinGeckoMarket): MarketCoin {
  return {
    id: raw.id,
    symbol: (raw.symbol ?? "").toUpperCase(),
    name: raw.name ?? raw.id,
    image: str(raw.image),
    rank: num(raw.market_cap_rank),
    price: num(raw.current_price),
    marketCap: num(raw.market_cap),
    volume24h: num(raw.total_volume),
    change24h: num(raw.price_change_percentage_24h),
    change7d: num(raw.price_change_percentage_7d_in_currency),
  };
}

/**
 * Daily volume across all markets is a fraction of total market cap. The
 * public API has been observed returning corrupt aggregates (e.g. $14,000T),
 * so anything beyond this ratio is treated as unknown rather than displayed.
 */
const MAX_PLAUSIBLE_VOLUME_TO_CAP = 5;

export function plausibleVolume(volume: number | null, marketCap: number | null): number | null {
  if (volume === null || volume < 0) return null;
  if (marketCap !== null && volume > marketCap * MAX_PLAUSIBLE_VOLUME_TO_CAP) return null;
  return volume;
}

export function mapGlobalStats(raw: CoinGeckoGlobal): GlobalStats {
  const data = raw.data;
  const totalMarketCapUsd = usd(data.total_market_cap);
  return {
    totalMarketCapUsd,
    totalVolumeUsd: plausibleVolume(usd(data.total_volume), totalMarketCapUsd),
    marketCapChange24h: num(data.market_cap_change_percentage_24h_usd),
    btcDominance: num(data.market_cap_percentage?.btc),
    ethDominance: num(data.market_cap_percentage?.eth),
    activeCryptocurrencies: num(data.active_cryptocurrencies),
  };
}

/**
 * CoinGecko's 7d sparkline is an array of hourly prices without timestamps,
 * ending at `last_updated`. Rebuild timestamps backwards from that anchor.
 */
export function mapSparkline(
  prices: (number | null | undefined)[] | null | undefined,
  endIso: string | null,
): PricePoint[] {
  const values = (prices ?? []).map(num);
  const end = endIso ? new Date(endIso).getTime() : NaN;
  if (values.length < 2 || Number.isNaN(end)) return [];
  const step = (7 * 24 * 60 * 60 * 1000) / (values.length - 1);
  return values.flatMap((price, index) =>
    price === null ? [] : [{ t: Math.round(end - (values.length - 1 - index) * step), price }],
  );
}

export function mapAssetDetail(raw: CoinGeckoCoin): AssetDetail {
  const md = raw.market_data;
  const lastUpdated = str(md?.last_updated) ?? str(raw.last_updated);

  return {
    id: raw.id,
    symbol: (raw.symbol ?? "").toUpperCase(),
    name: raw.name ?? raw.id,
    image: str(raw.image?.large) ?? str(raw.image?.small),
    rank: num(raw.market_cap_rank),
    description: toPlainText(raw.description?.en),
    homepage: firstLink(raw.links?.homepage),
    explorer: firstLink(raw.links?.blockchain_site),
    categories: (raw.categories ?? []).map(str).filter((c): c is string => c !== null).slice(0, 4),
    genesisDate: str(raw.genesis_date),
    hashingAlgorithm: str(raw.hashing_algorithm),
    lastUpdated,
    market: {
      price: usd(md?.current_price),
      marketCap: usd(md?.market_cap),
      fullyDilutedValuation: usd(md?.fully_diluted_valuation),
      volume24h: usd(md?.total_volume),
      high24h: usd(md?.high_24h),
      low24h: usd(md?.low_24h),
      change24h: num(md?.price_change_percentage_24h),
      change7d: num(md?.price_change_percentage_7d),
      change30d: num(md?.price_change_percentage_30d),
      change1y: num(md?.price_change_percentage_1y),
      circulatingSupply: num(md?.circulating_supply),
      totalSupply: num(md?.total_supply),
      maxSupply: num(md?.max_supply),
      ath: usd(md?.ath),
      athDate: str(md?.ath_date?.usd),
      atl: usd(md?.atl),
      atlDate: str(md?.atl_date?.usd),
    },
    sparkline7d: mapSparkline(md?.sparkline_7d?.price, lastUpdated),
  };
}
