import { ImageResponse } from "next/og";
import { getAsset } from "@/lib/api/coingecko";
import { siteConfig } from "@/lib/seo/site";
import { formatCompactUsd, formatPercent, formatPrice } from "@/lib/utils/format";

export const alt = `Crypto price, chart and market cap · ${siteConfig.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300; // matches the asset page

/** Per-asset social card: name, price, 24h move and market cap. Draws no remote images so it can't fail on them. */
export default async function AssetOpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAsset(id).catch(() => null);

  const change = asset?.market.change24h ?? null;
  const changeColor = change === null ? "#d6cbb4" : change >= 0 ? "#34d399" : "#f87171";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 85% 15%, #4a3208 0%, #1a140a 55%, #0d0c0a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700, color: "#efe8d8" }}>
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="g" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F5B301" />
                <stop offset="1" stopColor="#F7931A" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#g)" />
            <circle cx="16" cy="16" r="10.5" stroke="#fff" strokeWidth="2.2" />
            <path d="M11.5 15.5V22M16 12V20M20.5 9.5V17.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="10.3" y="17" width="2.4" height="3.6" rx=".6" fill="#fff" />
            <rect x="14.8" y="13.4" width="2.4" height="5" rx=".6" fill="#fff" />
            <rect x="19.3" y="11" width="2.4" height="5" rx=".6" fill="#fff" />
          </svg>
          {siteConfig.name}
        </div>

        {asset ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, fontSize: 64, fontWeight: 700 }}>
              {asset.name}
              <span style={{ fontSize: 44, color: "#d6cbb4" }}>{asset.symbol}</span>
              {asset.rank !== null && <span style={{ fontSize: 32, color: "#f5b301" }}>{`#${asset.rank}`}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
              <span style={{ fontSize: 96, fontWeight: 700, lineHeight: 1 }}>{formatPrice(asset.market.price)}</span>
              {change !== null && (
                <span style={{ fontSize: 44, fontWeight: 600, color: changeColor }}>{`${formatPercent(change)} 24h`}</span>
              )}
            </div>
            {asset.market.marketCap !== null && (
              <div style={{ fontSize: 30, color: "#d6cbb4" }}>{`Market cap ${formatCompactUsd(asset.market.marketCap)}`}</div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>Live crypto price, chart & market cap</div>
        )}

        <div style={{ display: "flex", height: 6, borderRadius: 999, background: "linear-gradient(90deg, #f5b301, #f7931a)" }} />
      </div>
    ),
    size,
  );
}
