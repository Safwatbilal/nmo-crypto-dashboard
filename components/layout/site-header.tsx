import Link from "next/link";
import { LogoFull } from "@/components/brand/logo";
import { siteConfig } from "@/lib/seo/site";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/**
 * Mobile: logo + theme toggle on the first row, nav as a full-width second row.
 * sm and up: a single row — logo, nav, toggle.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 px-4 sm:h-14 sm:flex-nowrap sm:gap-1 sm:px-6">
        <Link href="/" className="mr-auto flex h-14 items-center rounded-lg" aria-label={`${siteConfig.name} home`}>
          <LogoFull />
        </Link>
        <NavLinks className="order-last -mx-4 w-[calc(100%+2rem)] border-t border-border px-4 sm:order-none sm:mx-0 sm:w-auto sm:border-t-0 sm:px-0" />
        <ThemeToggle />
      </div>
    </header>
  );
}
