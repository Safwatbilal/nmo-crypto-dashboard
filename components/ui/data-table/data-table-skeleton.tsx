import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";

export interface DataTableSkeletonProps {
  rows?: number;
  /** One entry per column; the string is applied to both header and cells (e.g. `hidden md:table-cell`). */
  columns?: (string | undefined)[];
  className?: string;
}

/**
 * Placeholder table with the same shell as `DataTable`.
 * No hooks, so it can be used as a Suspense fallback from server components.
 */
export function DataTableSkeleton({ rows = 10, columns = [undefined, undefined, undefined, undefined], className }: DataTableSkeletonProps) {
  return (
    <div aria-hidden className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((cls, j) => (
              <TableHead key={j} className={cls}>
                <Skeleton className="h-3 w-12" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              {columns.map((cls, j) => (
                <TableCell key={j} className={cn("py-3", cls)}>
                  <Skeleton className={cn("h-4", j === 0 ? "w-6" : "w-full max-w-28")} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
