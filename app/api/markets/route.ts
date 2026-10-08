import { NextResponse, type NextRequest } from "next/server";
import { ASSET_ID_PATTERN, getMarketsByIds } from "@/lib/api/coingecko";
import { UpstreamError } from "@/lib/api/http";
import { MAX_WATCHLIST_SIZE } from "@/store/features/watchlistSlice";

/**
 * GET /api/markets?ids=bitcoin,ethereum
 *
 * Backend-for-frontend for the watchlist: the browser never calls CoinGecko
 * directly, so the optional API key stays server-side, responses go through
 * the shared Data Cache (60s), and the CDN can cache identical id sets.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").map((id) => id.trim()).filter(Boolean))];

  if (ids.length === 0 || ids.length > MAX_WATCHLIST_SIZE || !ids.every((id) => ASSET_ID_PATTERN.test(id))) {
    return NextResponse.json({ error: "Invalid ids parameter" }, { status: 400 });
  }

  try {
    const coins = await getMarketsByIds(ids);
    return NextResponse.json(
      { coins },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
    );
  } catch (error) {
    const status = error instanceof UpstreamError && error.status === 429 ? 503 : 502;
    return NextResponse.json({ error: "Market data provider unavailable" }, { status });
  }
}
