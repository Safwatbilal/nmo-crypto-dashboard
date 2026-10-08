"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from "@tanstack/react-table";
import * as m from "motion/react-m";
import { memo, useState, type ReactNode } from "react";
import { RetryPanel } from "@/components/ui/retry-panel";
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
  /** Rows to show. With `pagination` this is the current page only; with `pageSize` it's every row. */
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
  isError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  /** Replaces the default "No results" panel. */
  emptyState?: ReactNode;

  /** Server/URL-driven paging: the parent owns the page and passes only the current page's rows. */
  pagination?: ControlledPagination;
  /** Client-side paging over all of `data`. Ignored when `pagination` is given. */
  pageSize?: number;
  paginationLabel?: string;

  /** Client-side sorting via column headers (`column.getToggleSortingHandler()`). */
  enableSorting?: boolean;
  /** Fade/slide rows in — enable only after user interaction so SSR'd rows are visible immediately. */
  animateRows?: boolean;
  /** Mobile card body (below `lg`). Defaults to label / value pairs built from the columns. */
  renderCard?: (row: TData) => ReactNode;
  /** Column shown at the bottom of the default mobile card instead of as a label / value pair. */
  actionsColumnId?: string;
  /** Fade the rows (not the title/toolbar), e.g. while a deferred result is pending. */
  dimmed?: boolean;
  /** Extra content rendered under the rows (e.g. a bulk-actions bar). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Global data table, ported from the Tredro dashboard: a bordered shell with an
 * optional title + toolbar, the table on `lg+` and cards below it, loading /
 * error / empty states and a footer pager.
 * Column `meta` (see `types/tanstack-table.d.ts`) controls responsive classes.
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
  isError,
  errorTitle = "Couldn't load data",
  errorDescription,
  onRetry,
  emptyState,
  pagination,
  pageSize,
  paginationLabel,
  enableSorting = false,
  animateRows = false,
  renderCard,
  actionsColumnId = "actions",
  dimmed = false,
  footer,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalPage, setInternalPage] = useState(1);
  const internal = !pagination && pageSize !== undefined;

  // Back to page 1 when the data set itself changes size (e.g. filtered) —
  // adjusted during render rather than in an effect to avoid a second pass.
  const [prevLength, setPrevLength] = useState(data.length);
  if (prevLength !== data.length) {
    setPrevLength(data.length);
    setInternalPage(1);
  }

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting,
      ...(internal ? { pagination: { pageIndex: internalPage - 1, pageSize } } : {}),
    },
    onSortingChange: setSorting,
    enableSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(internal
      ? { getPaginationRowModel: getPaginationRowModel(), autoResetPageIndex: false }
      : { manualPagination: true }),
  });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();

  const pager: ControlledPagination | undefined = pagination
    ? pagination
    : internal
      ? {
          page: internalPage,
          pageCount: Math.max(1, Math.ceil(data.length / pageSize)),
          onPageChange: setInternalPage,
        }
      : undefined;

  const state: "error" | "loading" | "empty" | "rows" = isError
    ? "error"
    : isLoading
      ? "loading"
      : rows.length === 0
        ? "empty"
        : "rows";

  const statePanel =
    state === "error" ? (
      <RetryPanel title={errorTitle} description={errorDescription} onRetry={onRetry} />
    ) : state === "empty" ? (
      (emptyState ?? <StatePanel icon="search_error_outlined" title="No results" />)
    ) : null;

  return (
    <div className={cn(dataTableShellClassName, className)}>
      {title && <DataTableHeader title={title} titleId={titleId} badge={titleBadge} description={description} />}
      {toolbar && <div className="border-b border-border px-4 py-4 sm:px-6">{toolbar}</div>}

      <div className={cn("hidden overflow-x-auto px-6 transition-opacity lg:block", dimmed && "opacity-60")}>
        <Table aria-busy={state === "loading" || undefined}>
          {caption && <TableCaption className="sr-only">{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const sortDir = header.column.getIsSorted();
                  const content = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());
                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      colSpan={header.colSpan}
                      aria-sort={sortDir ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                      className={cn(meta?.className, meta?.headerClassName)}
                    >
                      {meta?.srOnlyHeader ? (
                        <span className="sr-only">{content}</span>
                      ) : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex cursor-pointer items-center gap-1 rounded hover:text-muted-foreground"
                        >
                          {content}
                          <span aria-hidden className="text-[0.65rem]">
                            {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : ""}
                          </span>
                        </button>
                      ) : (
                        content
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {statePanel ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={leafColumns.length} className="whitespace-normal">
                  {statePanel}
                </TableCell>
              </TableRow>
            ) : state === "loading" ? (
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
        {statePanel ??
          (state === "loading" ? (
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
                <li key={row.id} className={dataTableCardClassName}>
                  {renderCard ? renderCard(row.original) : <DefaultCardBody row={row} actionsColumnId={actionsColumnId} />}
                </li>
              ))}
            </ul>
          ))}
      </div>

      {footer}

      {!isError && pager && (
        <DataTablePagination {...pager} isLoading={isLoading} label={paginationLabel} />
      )}
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

  const selected = row.getIsSelected() ? "selected" : undefined;

  if (!animate) {
    return <TableRow data-state={selected}>{cells}</TableRow>;
  }
  return (
    <m.tr
      data-slot="table-row"
      data-state={selected}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={tableRowClassName}
    >
      {cells}
    </m.tr>
  );
}) as <TData>(props: { row: Row<TData>; animate: boolean }) => ReactNode;

/** Tredro's fallback mobile card: one label / value line per column, actions underneath. */
function DefaultCardBody<TData>({ row, actionsColumnId }: { row: Row<TData>; actionsColumnId: string }) {
  const cells = row.getVisibleCells();
  const actionsCell = cells.find((c) => c.column.id === actionsColumnId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        {cells
          .filter((c) => c !== actionsCell)
          .map((cell) => {
            const header = cell.column.columnDef.header;
            return (
              <div key={cell.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="shrink-0 text-muted-foreground">{typeof header === "string" ? header : cell.column.id}</span>
                <span className="text-right text-foreground">{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
              </div>
            );
          })}
      </div>
      {actionsCell && (
        <div className="flex justify-end border-t border-border pt-1">
          {flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
        </div>
      )}
    </div>
  );
}
