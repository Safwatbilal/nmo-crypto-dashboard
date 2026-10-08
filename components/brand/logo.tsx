import { cn } from "@/lib/utils/cn";

type LogoProps = { className?: string };

/** CoinPulse mark: a coin holding three rising candlesticks — prices and charts at a glance. */
export function LogoMark({ className }: LogoProps) {
  return (
    <span
      aria-hidden
      className={cn("flex size-8 shrink-0 rounded-[25%] bg-linear-to-br from-brand-from to-brand-to", className)}
    >
      <svg viewBox="0 0 32 32" fill="none" className="size-full">
        <circle cx="16" cy="16" r="10.5" stroke="#fff" strokeWidth="2.2" />
        <path d="M11.5 15.5V22M16 12V20M20.5 9.5V17.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="10.3" y="17" width="2.4" height="3.6" rx=".6" fill="#fff" />
        <rect x="14.8" y="13.4" width="2.4" height="5" rx=".6" fill="#fff" />
        <rect x="19.3" y="11" width="2.4" height="5" rx=".6" fill="#fff" />
      </svg>
    </span>
  );
}

/** Mark + wordmark. "Pulse" carries the brand gradient; "Coin" follows the text color. */
export function LogoFull({ className }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-bold tracking-tight">
        Coin<span className="bg-linear-to-r from-brand-from to-brand-to bg-clip-text text-transparent">Pulse</span>
      </span>
    </span>
  );
}
