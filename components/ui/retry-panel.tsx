"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "./button";
import { StatePanel } from "./state-panel";

interface RetryPanelProps {
  title?: string;
  description?: string;
  /** Route error boundaries pass their `retry`; otherwise the route is refreshed. */
  onRetry?: () => void;
  className?: string;
}

/** Recoverable error state for failed upstream requests. */
export function RetryPanel({
  title = "Market data is temporarily unavailable",
  description = "The data provider didn't respond (it may be rate-limiting requests). Please try again in a moment.",
  onRetry,
  className,
}: RetryPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const retry = () =>
    startTransition(() => {
      if (onRetry) onRetry();
      else router.refresh();
    });

  return (
    <StatePanel
      role="alert"
      tone="danger"
      icon="warning_outlined"
      title={title}
      description={description}
      className={className}
      action={
        <Button onClick={retry} disabled={pending} variant="outline">
          <IconRenderer name="refresh_outlined" aria-hidden className={pending ? "size-4 animate-spin" : "size-4"} />
          {pending ? "Retrying…" : "Try again"}
        </Button>
      }
    />
  );
}
