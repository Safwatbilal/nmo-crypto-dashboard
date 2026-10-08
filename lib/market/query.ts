import {
  CHANGE_FILTERS,
  SORT_KEYS,
  type ChangeFilter,
  type MarketCoin,
  type MarketQuery,
  type SortKey,
} from "@/types/market";

export const PAGE_SIZE = 20;
const MAX_QUERY_LENGTH = 60;

export const DEFAULT_QUERY: MarketQuery = {
  q: "",
  sort: "market_cap",
  filter: "all",
  page: 1,
};

export const SORT_LABELS: Record<SortKey, string> = {
  market_cap: "Market cap",
  volume: "24h volume",
  gainers: "Top gainers (24h)",
  losers: "Top losers (24h)",
  price: "Price",
  name: "Name (A–Z)",
};

export const FILTER_LABELS: Record<ChangeFilter, string> = {
  all: "All",
  gainers: "Gainers",
  losers: "Losers",
  watchlist: "Watchlist",
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function oneOf<T extends string>(options: readonly T[], value: string | undefined, fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

/** Parses untrusted URL search params into a valid `MarketQuery`. */
export function parseMarketQuery(params: RawParams): MarketQuery {
  const page = Number.parseInt(first(params.page) ?? "", 10);
  return {
    q: (first(params.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    sort: oneOf(SORT_KEYS, first(params.sort), DEFAULT_QUERY.sort),
    filter: oneOf(CHANGE_FILTERS, first(params.filter), DEFAULT_QUERY.filter),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Serialises a query, omitting defaults to keep shareable URLs short. */
export function toSearchString(query: MarketQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sort !== DEFAULT_QUERY.sort) params.set("sort", query.sort);
  if (query.filter !== DEFAULT_QUERY.filter) params.set("filter", query.filter);
  if (query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Nulls always sort last regardless of direction. */
function compareNullable(a: number | null, b: number | null, direction: 1 | -1): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * direction;
}

const comparators: Record<SortKey, (a: MarketCoin, b: MarketCoin) => number> = {
  market_cap: (a, b) => compareNullable(a.marketCap, b.marketCap, -1),
  volume: (a, b) => compareNullable(a.volume24h, b.volume24h, -1),
  gainers: (a, b) => compareNullable(a.change24h, b.change24h, -1),
  losers: (a, b) => compareNullable(a.change24h, b.change24h, 1),
  price: (a, b) => compareNullable(a.price, b.price, -1),
  name: (a, b) => a.name.localeCompare(b.name, "en"),
};

interface FilterContext {
  watchlistIds?: ReadonlySet<string>;
}

export function filterCoins(
  coins: readonly MarketCoin[],
  { q, filter }: Pick<MarketQuery, "q" | "filter">,
  { watchlistIds }: FilterContext = {},
): MarketCoin[] {
  const needle = q.trim().toLowerCase();
  return coins.filter((coin) => {
    if (needle && !coin.name.toLowerCase().includes(needle) && !coin.symbol.toLowerCase().includes(needle)) {
      return false;
    }
    switch (filter) {
      case "gainers":
        return (coin.change24h ?? 0) > 0;
      case "losers":
        return (coin.change24h ?? 0) < 0;
      case "watchlist":
        return watchlistIds?.has(coin.id) ?? false;
      default:
        return true;
    }
  });
}

/** Returns a new sorted array; the input (server data) is never mutated. */
export function sortCoins(coins: readonly MarketCoin[], sort: SortKey): MarketCoin[] {
  return [...coins].sort(comparators[sort]);
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
}

/** Clamps the requested page into range so stale URLs never render empty pages. */
export function paginate<T>(items: readonly T[], page: number, pageSize = PAGE_SIZE): Paginated<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageCount,
    total: items.length,
  };
}
