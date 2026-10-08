/**
 * Number/date formatting. Locale and time zone are pinned so server and
 * client renders produce identical strings (no hydration mismatches).
 */

const LOCALE = "en-US";
const EMPTY = "—";

const usdCompact = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const usdStandard = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdSmall = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  minimumSignificantDigits: 2,
  maximumSignificantDigits: 4,
});

const compactNumber = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 2,
});

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
  timeZoneName: "short",
});

const isFiniteNumber =(value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Price with precision adapted to magnitude ($83,062.00 / $0.0001234). */
export function formatPrice(value: number | null | undefined): string {
  if (!isFiniteNumber(value)) return EMPTY;
  if (value === 0) return usdStandard.format(0);
  return Math.abs(value) >= 1 ? usdStandard.format(value) : usdSmall.format(value);
}

/** Large USD amounts ($1.67T). */
export function formatCompactUsd(value: number | null | undefined): string {
  return isFiniteNumber(value) ? usdCompact.format(value) : EMPTY;
}

export function formatCompactNumber(value: number | null | undefined): string {
  return isFiniteNumber(value) ? compactNumber.format(value) : EMPTY;
}

/** Signed percentage, e.g. +1.24% / −0.83%. */
export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (!isFiniteNumber(value)) return EMPTY;
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return EMPTY;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? EMPTY : dateFormat.format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return EMPTY;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? EMPTY : dateTimeFormat.format(date);
}

export type Trend ="up" | "down" | "flat";

export function getTrend(value: number | null | undefined): Trend {
  if (!isFiniteNumber(value) || value === 0) return "flat";
  return value > 0 ? "up" : "down";
}
