import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface CoinAvatarProps {
  src: string | null;
  symbol: string;
  size?: number;
  preload?: boolean;
  className?: string;
}

/** Decorative logo (the name is always rendered next to it), with a lettermark fallback. */
export function CoinAvatar({ src, symbol, size = 28, preload, className }: CoinAvatarProps) {
  if (!src) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary",
          className,
        )}
      >
        {symbol.slice(0, 3)}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      preload={preload}
      className={cn("shrink-0 rounded-full bg-muted", className)}
    />
  );
}
