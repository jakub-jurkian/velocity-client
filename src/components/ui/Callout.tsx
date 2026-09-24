import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./Callout.module.scss";

interface Props {
  tone?: "primary" | "warning" | "danger";
  icon?: string;
  // Small uppercase lead-in above the content.
  title?: ReactNode;
  children: ReactNode;
  role?: "status" | "alert" | "note";
  className?: string;
}

// A highlighted note with an accent edge: a location banner, a warning, an
// error summary.
const Callout = ({ tone = "primary", icon, title, children, role, className }: Props) => (
  <div className={cx(styles.callout, styles[tone], className)} role={role}>
    {icon && (
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    )}
    <div className={styles.body}>
      {title && <span className={styles.title}>{title}</span>}
      {children}
    </div>
  </div>
);

export default Callout;
