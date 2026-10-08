import { describe, expect, it } from "vitest";
import { buildChartGeometry } from "@/lib/market/chart";
import { mapAssetDetail, mapMarketCoin, mapSparkline, plausibleVolume, toPlainText } from "@/lib/api/mappers";
import { formatCompactUsd, formatPercent, formatPrice } from "@/lib/utils/format";
import type { CoinGeckoCoin } from "@/types/coingecko";

describe("mapMarketCoin", () => {
  it("normalises missing and non-finite fields to null", () => {
    const coin = mapMarketCoin({
      id: "x",
      symbol: "xyz",
      name: "X",
      image: "",
      current_price: Number.NaN,
      market_cap: null,
      market_cap_rank: undefined,
      total_volume: 10,
      price_change_percentage_24h: null,
    });
    expect(coin).toMatchObject({ symbol: "XYZ", image: null, price: null, marketCap: null, rank: null, volume24h: 10, change7d: null });
  });
});

describe("mapAssetDetail", () => {
  it("survives an almost empty payload", () => {
    const raw = { id: "ghost", symbol: "gh", name: "Ghost" } as CoinGeckoCoin;
    const asset = mapAssetDetail(raw);
    expect(asset.market.price).toBeNull();
    expect(asset.categories).toEqual([]);
    expect(asset.sparkline7d).toEqual([]);
    expect(asset.homepage).toBeNull();
  });

  it("only keeps https links", () => {
    const raw = {
      id: "a",
      symbol: "a",
      name: "A",
      links: { homepage: ["", "http://insecure.example", "https://a.example"] },
    } as CoinGeckoCoin;
    expect(mapAssetDetail(raw).homepage).toBe("https://a.example");
  });
});

describe("plausibleVolume", () => {
  it("drops corrupt aggregates observed from the public API", () => {
    expect(plausibleVolume(14_249_177_473_976_216, 2_796_677_949_533)).toBeNull();
    expect(plausibleVolume(120_000_000_000, 2_796_677_949_533)).toBe(120_000_000_000);
    expect(plausibleVolume(-1, null)).toBeNull();
  });
});

describe("toPlainText", () => {
  it("strips HTML and truncates on a word boundary", () => {
    expect(toPlainText('<a href="x">Bitcoin</a> is   money')).toBe("Bitcoin is money");
    expect(toPlainText("one two three four", 9)).toBe("one two…");
    expect(toPlainText("   ")).toBeNull();
  });
});

describe("mapSparkline", () => {
  it("rebuilds hourly timestamps ending at last_updated and drops gaps", () => {
    const end = "2026-01-08T00:00:00.000Z";
    const points = mapSparkline([1, null, 3], end);
    expect(points).toHaveLength(2);
    expect(points[1]).toEqual({ t: Date.parse(end), price: 3 });
    expect(points[0].t).toBe(Date.parse(end) - 7 * 24 * 3600 * 1000);
  });

  it("returns [] without enough data or a valid anchor", () => {
    expect(mapSparkline([1], "2026-01-08T00:00:00Z")).toEqual([]);
    expect(mapSparkline([1, 2], null)).toEqual([]);
  });
});

describe("buildChartGeometry", () => {
  it("finds extremes and spans the full width", () => {
    const chart = buildChartGeometry(
      [
        { t: 0, price: 10 },
        { t: 50, price: 30 },
        { t: 100, price: 20 },
      ],
      200,
      100,
      0,
    );
    expect(chart?.min.price).toBe(10);
    expect(chart?.max.price).toBe(30);
    expect(chart?.linePath).toBe("M0.00,100.00L100.00,0.00L200.00,50.00");
  });

  it("handles a flat series without dividing by zero", () => {
    const chart = buildChartGeometry([{ t: 0, price: 5 }, { t: 1, price: 5 }], 100, 50);
    expect(chart?.linePath).not.toContain("NaN");
  });
});

describe("formatters", () => {
  it("formats prices by magnitude and handles null", () => {
    expect(formatPrice(83062)).toBe("$83,062.00");
    expect(formatPrice(0.00012345)).toBe("$0.0001235");
    expect(formatPrice(null)).toBe("—");
    expect(formatCompactUsd(1_670_000_000_000)).toBe("$1.67T");
    expect(formatPercent(-0.8358)).toBe("−0.84%");
    expect(formatPercent(2)).toBe("+2.00%");
  });
});
