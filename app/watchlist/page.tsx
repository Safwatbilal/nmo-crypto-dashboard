import type { Metadata } from "next";
import { WatchlistView } from "@/components/watchlist/watchlist-view";

/**
 * Rendering: static shell + client data.
 *
 * The watchlist lives in the visitor's browser (localStorage), so the server
 * cannot know what to render. The shell is prerendered at build time; the
 * list hydrates from Redux and prices load through /api/markets.
 * Personal content → excluded from search indexing.
 */
export const metadata: Metadata = {
  title: "Your watchlist",
  description: "Your saved crypto assets with live prices.",
  alternates: { canonical: "/watchlist" },
  robots: { index: false, follow: true },
};

export default function WatchlistPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Watchlist</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Assets you follow. Prices update live where a Binance pair is available.
        </p>
      </header>
      <WatchlistView />
    </div>
  );
}
