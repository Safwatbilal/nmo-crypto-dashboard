"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RetryPanel } from "@/components/ui/retry-panel";

export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Server errors arrive with a digest that matches the server log entry.
    console.error("[route-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <Card>
      <RetryPanel
        title="Something went wrong"
        description="We couldn't load this page. This is usually temporary (the data provider may be rate-limiting)."
        onRetry={retry}
      />
    </Card>
  );
}
