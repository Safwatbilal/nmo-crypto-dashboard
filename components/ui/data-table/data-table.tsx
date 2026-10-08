"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type Row } from "@tanstack/react-table";
import * as m from "motion/react-m";
import { memo, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableCellClassName,
  tableRowClassName,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableHeader, dataTableCardClassName, dataTableShellClassName } from "./data-table-shell";

interface ControlledPagination {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  /** Rows of the current page only — filtering, sorting and paging happen upstream (URL-driven). */
  data: TData[];
  getRowId?: (row: TData) => string;
  /** Accessible table caption (visually hidden). */
  caption?: string;

  /** Title row at the top of the shell (Tredro list header). */
  title?: ReactNode;
  /** `id` for the title heading, so a surrounding section can be `aria-labelledby` it. */
  titleId?: string;
  /** Count pill next to the title, e.g. "250 assets". */
  titleBadge?: ReactNode;
  description?: ReactNode;
  /** Search / filters row under the title. */
  toolbar?: ReactNode;

  isLoading?: boolean;
  /** Skeleton row count while loading. */
  loadingRows?: number;
  /** Replaces the default "No results" panel. */
  emptyState?: ReactNode;

  /** The parent owns the page and passes only the current page's rows. */
  pagination?: ControlledPagination;
  paginationLabel?: string;

  /** Fade/slide rows in — enable only after user interaction so SSR'd rows are visible immediately. */
  animateRows?: boolean;
  /** Mobile card body (below `lg`). */
  renderCard: (row: TData) => ReactNode;
  /** Fade the rows (not the title/toolbar), e.g. while a deferred result is pending. */
  dimmed?: boolean;
  className?: string;
}

/**
 * Data table ported from the Tredro dashboard: a bordered shell with an
 * optional title + toolbar, the table on `lg+` and cards below it, loading /
 * empty states and a footer pager. TanStack Table supplies the headless
 * column/row model; column `meta` (see `types/tanstack-table.d.ts`) controls
 * responsive classes.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  caption,
  title,
  titleId,
  titleBadge,
  description,
  toolbar,
  isLoading,
  loadingRows = 8,
  emptyState,
  pagination,
  paginationLabel,
  animateRows = false,
  renderCard,
  dimmed = false,
  className,
}: DataTableProps<TData, TValue>) {
  // React Compiler is not enabled (next.config.ts), so nothing is auto-memoised
  // here; the memoisation that matters is explicit (DataTableRow, DataTablePagination).
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getRowId, getCoreRowModel: getCoreRowModel(), manualPagination: true });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();
  const isEmpty = !isLoading && rows.length === 0;
  const empty = emptyState ?? <StatePanel icon="search_error_outlined" title="No results" />;

  return (
    <div className={cn(dataTableShellClassName, className)}>
      {title && <DataTableHeader title={title} titleId={titleId} badge={titleBadge} description={description} />}
      {toolbar && <div className="border-b border-border px-4 py-4 sm:px-6">{toolbar}</div>}

      <div className={cn("hidden overflow-x-auto px-6 transition-opacity lg:block", dimmed && "opacity-60")}>
        <Table aria-busy={isLoading || undefined}>
          {caption && <TableCaption className="sr-only">{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const content = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());
                  return (
                    <TableHead key={header.id} scope="col" colSpan={header.colSpan} className={meta?.className}>
                      {meta?.srOnlyHeader ? <span className="sr-only">{content}</span> : content}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={leafColumns.length} className="whitespace-normal">
                  {empty}
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: loadingRows }, (_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {leafColumns.map((col) => (
                    <TableCell key={col.id} className={col.columnDef.meta?.className}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              rows.map((row) => <DataTableRow key={row.id} row={row} animate={animateRows} />)
            )}
          </TableBody>
        </Table>
      </div>

      <div className={cn("flex flex-col gap-3 px-4 py-3 transition-opacity lg:hidden", dimmed && "opacity-60")}>
        {isEmpty ? (
          empty
        ) : isLoading ? (
          <ul aria-hidden className="flex flex-col gap-3">
            {Array.from({ length: Math.min(loadingRows, 5) }, (_, i) => (
              <li key={i} className={cn(dataTableCardClassName, "flex flex-col gap-2")}>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.id} className={cn("relative", dataTableCardClassName)}>
                {renderCard(row.original)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {pagination && <DataTablePagination {...pagination} isLoading={isLoading} label={paginationLabel} />}
    </div>
  );
}

// Memoised: TanStack keeps row objects stable while data is unchanged, so rows
// skip re-rendering when only the shell (title, toolbar) changes.
const DataTableRow = memo(function DataTableRow<TData>({ row, animate }: { row: Row<TData>; animate: boolean }) {
  const cells = row.getVisibleCells().map((cell) => {
    const meta = cell.column.columnDef.meta;
    const className = cn(meta?.className, meta?.cellClassName);
    const content = flexRender(cell.column.columnDef.cell, cell.getContext());
    return meta?.rowHeader ? (
      <th key={cell.id} scope="row" className={cn(tableCellClassName, "text-left font-normal", className)}>
        {content}
      </th>
    ) : (
      <TableCell key={cell.id} className={className}>
        {content}
      </TableCell>
    );
  });

  if (!animate) {
    return <TableRow>{cells}</TableRow>;
  }
  return (
    <m.tr
      data-slot="table-row"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={tableRowClassName}
    >
      {cells}
    </m.tr>
  );
}) as <TData>(props: { row: Row<TData>; animate: boolean }) => ReactNode;
