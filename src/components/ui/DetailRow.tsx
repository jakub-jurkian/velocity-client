import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./DetailRow.module.scss";

interface Props {
  label: ReactNode;
  children: ReactNode;
  // "highlight" tints the value, "mono" is for ids, "total" for the sum.
  variant?: "highlight" | "mono" | "total";
}

// A label on the left, its value on the right: booking summaries and cards.
const DetailRow = ({ label, children, variant }: Props) => (
  <div className={cx(styles.row, variant && styles[variant])}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{children}</span>
  </div>
);

export const Divider = () => <hr className={styles.divider} />;

export default DetailRow;
