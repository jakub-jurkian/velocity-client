import type { ReactNode } from "react";
import styles from "./StatCard.module.scss";

interface Props {
  label: string;
  value: ReactNode;
  unit?: string;
  // A short line under the value.
  hint?: ReactNode;
  // Anything richer than a hint, pinned to the card's foot (e.g. a badge).
  children?: ReactNode;
}

// One headline number with its label: dashboard and admin KPIs.
const StatCard = ({ label, value, unit, hint, children }: Props) => (
  <article className={styles.card}>
    <h3 className={styles.label}>{label}</h3>
    <div className={styles.value}>
      {value}
      {unit && <span className={styles.unit}>{unit}</span>}
    </div>
    {hint && <p className={styles.hint}>{hint}</p>}
    {children && <div className={styles.footer}>{children}</div>}
  </article>
);

export default StatCard;
