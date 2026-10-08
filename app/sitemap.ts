import type { MetadataRoute } from "next";
import { getMarkets } from "@/lib/api/coingecko";
import { absoluteUrl } from "@/lib/seo/site";

/** Lists the top 100 asset pages; revalidates together with the markets fetch (60s). */

const SITEMAP_ASSET_COUNT = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/"),
    changeFrequency: "always",
    priority: 1,
  };

  try {
    const coins = await getMarkets();
    return [
      home,
      ...coins.slice(0, SITEMAP_ASSET_COUNT).map((coin) => ({
        url: absoluteUrl(`/market/${coin.id}`),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // Upstream unavailable (e.g. during build): ship a minimal sitemap
    // rather than failing; it is regenerated on the next revalidation.
    return [home];
  }
}
