import { IconRenderer } from "@/assets/icons/iconRenderer";
import type { iconName } from "@/assets/icons/iconRenderer/types";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StatePanelProps {
  icon: iconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
  /** Use "alert" for errors so screen readers announce them. */
  role?: "status" | "alert";
}

/** Shared empty / error / not-found presentation (Tredro EmptyState pattern). */
export function StatePanel({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
  role = "status",
}: StatePanelProps) {
  return (
    <div
      role={role}
      className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}
    >
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full blur-xl",
            tone === "danger" ? "bg-negative/15" : "bg-primary/15",
          )}
        />
        <div
          className={cn(
            "relative flex size-14 items-center justify-center rounded-2xl",
            tone === "danger" ? "bg-negative/10 text-negative" : "bg-primary/10 text-primary",
          )}
        >
          <IconRenderer name={icon} aria-hidden className="size-7" />
        </div>
      </div>
      <h2 className="mt-5 text-base font-semibold sm:text-lg">{title}</h2>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}
