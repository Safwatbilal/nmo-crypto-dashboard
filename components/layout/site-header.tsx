import { IconRenderer } from "@/assets/icons/iconRenderer";
import Link from "next/link";
import { siteConfig } from "@/lib/seo/site";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconRenderer name="activity_log_outlined" aria-hidden className="size-4" />
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
          <span className="sr-only sm:hidden">{siteConfig.name} home</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavLinks />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
