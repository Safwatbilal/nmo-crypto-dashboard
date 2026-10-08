import { describe, expect, it } from "vitest";
import { getPageWindow } from "@/components/ui/data-table/data-table-pagination";
import { DEFAULT_QUERY, filterCoins, paginate, parseMarketQuery, sortCoins, toSearchString } from "@/lib/market/query";
import { COINS } from "./fixtures";

describe("parseMarketQuery", () => {
  it("falls back to defaults for missing or invalid params", () => {
    expect(parseMarketQuery({})).toEqual(DEFAULT_QUERY);
    expect(parseMarketQuery({ sort: "hack", filter: "nope", page: "-3" })).toEqual(DEFAULT_QUERY);
  });

  it("accepts valid params and takes the first value of repeated keys", () => {
    expect(parseMarketQuery({ q: ["  btc ", "eth"], sort: "volume", filter: "gainers", page: "4" })).toEqual({
      q: "btc",
      sort: "volume",
      filter: "gainers",
      page: 4,
    });
  });

  it("caps the search length", () => {
    expect(parseMarketQuery({ q: "x".repeat(500) }).q).toHaveLength(60);
  });
});

describe("toSearchString", () => {
  it("omits defaults and round-trips through the parser", () => {
    expect(toSearchString(DEFAULT_QUERY)).toBe("");
    const query = { q: "sol", sort: "gainers", filter: "watchlist", page: 2 } as const;
    const params = Object.fromEntries(new URLSearchParams(toSearchString(query)));
    expect(parseMarketQuery(params)).toEqual(query);
  });
});

describe("filterCoins", () => {
  it("matches name or symbol case-insensitively", () => {
    expect(filterCoins(COINS, { q: "eth", filter: "all" }).map((c) => c.id)).toEqual(["ethereum"]);
    expect(filterCoins(COINS, { q: "SOL", filter: "all" }).map((c) => c.id)).toEqual(["solana"]);
  });

  it("filters gainers and losers, treating missing change as neither", () => {
    expect(filterCoins(COINS, { q: "", filter: "gainers" }).map((c) => c.id)).toEqual(["bitcoin", "solana"]);
    expect(filterCoins(COINS, { q: "", filter: "losers" }).map((c) => c.id)).toEqual(["ethereum"]);
  });

  it("filters by watchlist ids", () => {
    const watchlistIds = new Set(["solana", "mystery"]);
    expect(filterCoins(COINS, { q: "", filter: "watchlist" }, { watchlistIds }).map((c) => c.id)).toEqual([
      "solana",
      "mystery",
    ]);
    expect(filterCoins(COINS, { q: "", filter: "watchlist" })).toEqual([]);
  });
});

describe("sortCoins", () => {
  it("sorts by each key and keeps nulls last", () => {
    expect(sortCoins(COINS, "market_cap").map((c) => c.id)).toEqual(["bitcoin", "ethereum", "solana", "mystery"]);
    expect(sortCoins(COINS, "volume").map((c) => c.id)).toEqual(["ethereum", "bitcoin", "solana", "mystery"]);
    expect(sortCoins(COINS, "gainers").map((c) => c.id)).toEqual(["solana", "bitcoin", "ethereum", "mystery"]);
    expect(sortCoins(COINS, "losers").map((c) => c.id)).toEqual(["ethereum", "bitcoin", "solana", "mystery"]);
    expect(sortCoins(COINS, "name").map((c) => c.id)).toEqual(["bitcoin", "ethereum", "mystery", "solana"]);
  });

  it("does not mutate the input array", () => {
    const input = [...COINS];
    sortCoins(input, "name");
    expect(input).toEqual(COINS);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 45 }, (_, i) => i);

  it("slices the requested page", () => {
    expect(paginate(items, 3, 20)).toEqual({ items: [40, 41, 42, 43, 44], page: 3, pageCount: 3, total: 45 });
  });

  it("clamps out-of-range pages", () => {
    expect(paginate(items, 99, 20).page).toBe(3);
    expect(paginate([], 5, 20)).toEqual({ items: [], page: 1, pageCount: 1, total: 0 });
  });
});

describe("getPageWindow", () => {
  it("shows first, last and neighbours with gaps", () => {
    expect(getPageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(getPageWindow(6, 13)).toEqual([1, null, 5, 6, 7, null, 13]);
    expect(getPageWindow(1, 1)).toEqual([1]);
  });

  it("widens the window near either end", () => {
    expect(getPageWindow(2, 13)).toEqual([1, 2, 3, 4, null, 13]);
    expect(getPageWindow(12, 13)).toEqual([1, null, 10, 11, 12, 13]);
  });
});
