import type { ReactNode } from "react";
import styles from "./EmptyState.module.scss";

interface Props {
  icon: string;
  title: ReactNode;
  children?: ReactNode;
  // A way forward, e.g. a button to try again.
  action?: ReactNode;
}

// What a list shows when there is nothing in it.
const EmptyState = ({ icon, title, children, action }: Props) => (
  <div className={styles.empty}>
    <div className={styles.icon} aria-hidden="true">
      {icon}
    </div>
    <h2 className={styles.title}>{title}</h2>
    {children && <p className={styles.message}>{children}</p>}
    {action}
  </div>
);

export default EmptyState;
