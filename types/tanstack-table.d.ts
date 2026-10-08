import "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // Generic params must match the library's declaration to merge.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Applied to both the header and body cells (e.g. responsive `hidden md:table-cell`). */
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
    /** Render body cells as `<th scope="row">` — use for the column that names the row. */
    rowHeader?: boolean;
    /** Visually hidden header label (for icon-only columns). */
    srOnlyHeader?: boolean;
  }
}
