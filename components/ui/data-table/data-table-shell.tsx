import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

/** Outer frame of the Tredro list: one bordered box holding title, toolbar, rows and pager. */
export const dataTableShellClassName = "overflow-hidden rounded-md border border-border";

/** Mobile row card (Tredro `Card` + `CardContent p-4`). */
export const dataTableCardClassName = "rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10";

interface DataTableHeaderProps {
  title: ReactNode;
  titleId?: string;
  badge?: ReactNode;
  description?: ReactNode;
}

/** Title row with a count badge, as at the top of Tredro's list pages. No hooks — safe in server fallbacks. */
export function DataTableHeader({ title, titleId, badge, description }: DataTableHeaderProps) {
  return (
    <div className="border-b border-border px-4 py-6 sm:px-6">
      <h2 id={titleId} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span>{title}</span>
        {badge !== undefined && <Badge className="font-normal tabular">{badge}</Badge>}
      </h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
