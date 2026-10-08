"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { selectIsWatchlistHydrated, selectWatchlistCount } from "@/store/features/watchlistSlice";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Market", icon: "sales_outlined" as const, match: (p: string) => p === "/" || p.startsWith("/market") },
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

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <IconRenderer name={icon} aria-hidden className="size-4" />
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
