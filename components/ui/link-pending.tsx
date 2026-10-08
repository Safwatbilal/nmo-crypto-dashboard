"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Inline navigation feedback for a <Link>. Asset pages are ISR-rendered on
 * first visit, so that one navigation can take a moment.
 */
export function LinkPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "size-3.5 shrink-0 rounded-full border-2 border-primary/30 border-t-primary transition-opacity",
        pending ? "animate-spin opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
