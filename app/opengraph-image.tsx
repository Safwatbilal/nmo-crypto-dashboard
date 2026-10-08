import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card, generated once at build time (no external data). */
export default function OpengraphImage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 44, fontWeight: 700 }}>
          <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
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
          <div style={{ display: "flex" }}>
            Coin
            <span style={{ backgroundImage: "linear-gradient(90deg, #f5b301, #f7931a)", backgroundClip: "text", color: "transparent" }}>
              Pulse
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>Real-time crypto market intelligence</div>
          <div style={{ fontSize: 30, color: "#d6cbb4" }}>Live prices · Market caps · 7-day charts · Watchlist</div>
        </div>
        <div style={{ display: "flex", height: 6, borderRadius: 999, background: "linear-gradient(90deg, #f5b301, #f7931a)" }} />
      </div>
    ),
    size,
  );
}
