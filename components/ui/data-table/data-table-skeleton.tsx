import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";
import { DataTableHeader, dataTableCardClassName, dataTableShellClassName } from "./data-table-shell";

export interface DataTableSkeletonProps {
  rows?: number;
  /** One entry per column; the string is applied to both header and cells (e.g. `hidden xl:table-cell`). */
  columns?: (string | undefined)[];
  /** Real title row, so the heading is in place before data arrives. */
  title?: ReactNode;
  titleId?: string;
  description?: ReactNode;
  /** Reserve the toolbar row. */
  toolbar?: boolean;
  className?: string;
}

/**
 * Placeholder with the same shell as `DataTable`.
 * No hooks, so it can be used as a Suspense fallback from server components.
 */
export function DataTableSkeleton({
  rows = 10,
  columns = [undefined, undefined, undefined, undefined],
  title,
  titleId,
  description,
  toolbar,
  className,
}: DataTableSkeletonProps) {
  return (
    <div className={cn(dataTableShellClassName, className)}>
      {title && <DataTableHeader title={title} titleId={titleId} description={description} />}
      <div aria-hidden>
        {toolbar && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
            <Skeleton className="h-9 w-full sm:w-70" />
            <Skeleton className="h-9 w-full sm:w-64" />
          </div>
        )}

        <div className="hidden px-6 lg:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((cls, j) => (
                  <TableHead key={j} className={cls}>
                    <Skeleton className="h-4 w-12" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }, (_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {columns.map((cls, j) => (
                    <TableCell key={j} className={cls}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ul className="flex flex-col gap-3 px-4 py-3 lg:hidden">
          {Array.from({ length: Math.min(rows, 5) }, (_, i) => (
            <li key={i} className={cn(dataTableCardClassName, "flex flex-col gap-2")}>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
