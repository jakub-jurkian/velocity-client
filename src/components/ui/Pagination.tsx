import type { PaginationMeta } from "../../types/Pagination";
import Button from "./Button";
import styles from "./Pagination.module.scss";

interface Props {
  meta: PaginationMeta;
  onChange: (page: number) => void;
  // True while a page is loading, so a second click cannot skip past it.
  disabled?: boolean;
  // Accessible name of the navigation, e.g. "User pages".
  label: string;
  // What the total counts, e.g. "users".
  noun: string;
}

// Previous / Next under a paginated list. Renders nothing for a single page.
const Pagination = ({ meta, onChange, disabled, label, noun }: Props) => {
  if (meta.totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label={label}>
      <Button
        variant="secondary"
        onClick={() => onChange(meta.currentPage - 1)}
        disabled={!meta.hasPrevious || disabled}
      >
        ← Previous
      </Button>

      <span className={styles.info} aria-live="polite">
        Page {meta.currentPage + 1} of {meta.totalPages}
        <span className={styles.total}>
          {" "}
          ({meta.totalElements} {noun})
        </span>
      </span>

      <Button
        variant="secondary"
        onClick={() => onChange(meta.currentPage + 1)}
        disabled={!meta.hasNext || disabled}
      >
        Next →
      </Button>
    </nav>
  );
};

export default Pagination;
