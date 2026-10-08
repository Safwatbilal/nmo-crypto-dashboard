"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MARKET_TABLE_TITLE_ID } from "@/components/market/market-table-meta";
import { selectIsWatchlistHydrated, selectWatchlistCount } from "@/store/features/watchlistSlice";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "globe_outlined" as const, match: (p: string) => p === "/" },
  { href: `/#${MARKET_TABLE_TITLE_ID}`, label: "Market", icon: "sales_outlined" as const, match: (p: string) => p.startsWith("/market") },
  { href: "/watchlist", label: "Watchlist", icon: "star_outlined" as const, match: (p: string) => p.startsWith("/watchlist") },
] as const;

function WatchlistCount() {
  const count = useAppSelector(selectWatchlistCount);
  const hydrated = useAppSelector(selectIsWatchlistHydrated);
  if (!hydrated || count === 0) return null;
  return (
    <span className="ml-0.5 rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-5 text-primary-foreground tabular">
      {count}
      <span className="sr-only"> saved</span>
    </span>
  );
}

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center sm:gap-1">
        {NAV_ITEMS.map(({ href, label, icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1 sm:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 w-full items-center justify-center gap-1.5 px-3 text-sm font-medium transition-colors sm:h-9 sm:rounded-lg",
                  active
                    ? "text-primary after:absolute after:inset-x-6 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary sm:bg-primary/10 sm:after:hidden"
                    : "text-muted-foreground hover:text-foreground sm:hover:bg-muted",
                )}
              >
                <IconRenderer name={icon} aria-hidden className="hidden size-4 sm:block" />
                {label}
                {href === "/watchlist" && <WatchlistCount />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
