import Link from "next/link";
import { LogoFull, LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/lib/seo/site";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="rounded-lg" aria-label={`${siteConfig.name} home`}>
          <LogoMark className="sm:hidden" />
          <LogoFull className="hidden sm:flex" />
        </Link>
        <div className="flex items-center gap-1">
          <NavLinks />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
