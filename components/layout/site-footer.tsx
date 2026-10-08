import { siteConfig } from "@/lib/seo/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {siteConfig.name} · Market data by{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="https://www.coingecko.com" rel="noopener noreferrer" target="_blank">
            CoinGecko
          </a>
          , live prices by{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="https://www.binance.com" rel="noopener noreferrer" target="_blank">
            Binance
          </a>
          .
        </p>
        <p>For information only — not financial advice.</p>
      </div>
    </footer>
  );
}
