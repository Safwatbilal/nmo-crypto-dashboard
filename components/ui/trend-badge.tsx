import { formatPercent, getTrend } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const ARROWS = { up: "▲", down: "▼", flat: "" } as const;
const SR_LABELS = { up: "up", down: "down", flat: "unchanged" } as const;

interface TrendBadgeProps {
  value: number | null | undefined;
  variant?: "text" | "pill";
  className?: string;
}

/**
 * Percentage change. Direction is conveyed by sign, arrow glyph and
 * screen-reader text — never by colour alone.
 */
export function TrendBadge({ value, variant = "text", className }: TrendBadgeProps) {
  const trend = getTrend(value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tabular",
        trend === "up" && "text-positive",
        trend === "down" && "text-negative",
        trend === "flat" && "text-muted-foreground",
        variant === "pill" && "rounded-md px-1.5 py-0.5 text-xs",
        variant === "pill" && trend === "up" && "bg-positive/10",
        variant === "pill" && trend === "down" && "bg-negative/10",
        variant === "pill" && trend === "flat" && "bg-muted",
        className,
      )}
    >
      {ARROWS[trend] && (
        <span aria-hidden className="text-[0.65em]">
          {ARROWS[trend]}
        </span>
      )}
      <span className="sr-only">{SR_LABELS[trend]}</span>
      {formatPercent(value)}
    </span>
  );
}
