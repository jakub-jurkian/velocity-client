import type { CSSProperties, ReactNode } from "react";
import styles from "./DataTable.module.scss";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  // "primary" heads the row's card on phones; "actions" holds its buttons.
  kind?: "primary" | "actions";
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowClassName?: (row: T) => string | undefined;
  // Shown in place of the rows when there are none (and none are loading).
  empty: ReactNode;
  isLoading?: boolean;
  // Below this width the desktop table scrolls instead of squeezing.
  minWidth?: number;
}

// A table on desktop that becomes a stack of cards on smaller screens, each
// value labelled by its column header.
const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  rowClassName,
  empty,
  isLoading = false,
  minWidth = 700,
}: Props<T>) => (
  <div className={styles.container}>
    <table className={styles.table} style={{ "--min-width": `${minWidth}px` } as CSSProperties}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header} className={column.kind === "actions" ? styles.alignRight : undefined}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && !isLoading ? (
          <tr className={styles.emptyRow}>
            <td colSpan={columns.length}>{empty}</td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={rowKey(row)} className={rowClassName?.(row)}>
              {columns.map((column) =>
                column.kind ? (
                  <td key={column.header} className={styles[column.kind]}>
                    {column.cell(row)}
                  </td>
                ) : (
                  <td key={column.header} data-label={column.header}>
                    <span className={styles.value}>{column.cell(row)}</span>
                  </td>
                ),
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;
