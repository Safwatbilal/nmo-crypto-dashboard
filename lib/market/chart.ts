import type { PricePoint } from "@/types/market";

export interface ChartGeometry {
  linePath: string;
  areaPath: string;
  min: PricePoint;
  max: PricePoint;
  first: PricePoint;
  last: PricePoint;
  /** Y coordinate helper for annotating values. */
  y: (price: number) => number;
}

/** Builds SVG paths for a price series. Returns null when there's nothing to draw. */
export function buildChartGeometry(
  points: readonly PricePoint[],
  width: number,
  height: number,
  paddingY = 8,
): ChartGeometry | null {
  if (points.length < 2) return null;

  let min = points[0];
  let max = points[0];
  for (const point of points) {
    if (point.price < min.price) min = point;
    if (point.price > max.price) max = point;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const spanT = last.t - first.t || 1;
  const spanP = max.price - min.price || 1;
  const usable = height - paddingY * 2;

  const x = (t: number) => ((t - first.t) / spanT) * width;
  const y = (price: number) => paddingY + (1 - (price - min.price) / spanP) * usable;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(2)},${y(p.price).toFixed(2)}`)
    .join("");
  const areaPath = `${linePath}L${width},${height}L0,${height}Z`;

  return { linePath, areaPath, min, max, first, last, y };
}
