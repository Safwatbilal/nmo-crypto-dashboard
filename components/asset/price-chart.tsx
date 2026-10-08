import { buildChartGeometry } from "@/lib/market/chart";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { PricePoint } from "@/types/market";

const WIDTH = 600;
const HEIGHT = 220;

/**
 * Server-rendered SVG chart: zero client JS and no chart library in the
 * bundle. It's part of the ISR HTML, so it's cached together with the page.
 */
export function PriceChart({ points, name }: { points: PricePoint[]; name: string }) {
  const chart = buildChartGeometry(points, WIDTH, HEIGHT);

  if (!chart) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
        No chart data available for this asset.
      </div>
    );
  }

  const rising = chart.last.price >= chart.first.price;
  const summary = `${name} 7-day price chart: from ${formatPrice(chart.first.price)} to ${formatPrice(
    chart.last.price,
  )}, ranging between ${formatPrice(chart.min.price)} and ${formatPrice(chart.max.price)}.`;

  return (
    <figure className={cn("flex flex-col gap-2", rising ? "text-positive" : "text-negative")}>
      <div className="flex justify-between text-xs text-muted-foreground tabular">
        <span>High {formatPrice(chart.max.price)}</span>
        <span>Low {formatPrice(chart.min.price)}</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={summary}
        className="h-48 w-full overflow-visible sm:h-56"
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={WIDTH}
            y1={HEIGHT * ratio}
            y2={HEIGHT * ratio}
            className="stroke-border"
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={chart.areaPath} fill="url(#chart-fill)" />
        <path
          d={chart.linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(new Date(chart.first.t).toISOString())}</span>
        <span>{formatDate(new Date(chart.last.t).toISOString())}</span>
      </figcaption>
    </figure>
  );
}
