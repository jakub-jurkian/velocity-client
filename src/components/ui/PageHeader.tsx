import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./PageHeader.module.scss";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  // Buttons beside the title from tablet width up, below it on phones.
  actions?: ReactNode;
  align?: "left" | "center";
  // "lg" for public and account pages, "md" for the denser admin screens.
  size?: "md" | "lg";
}

// A page's heading and one-line description.
const PageHeader = ({ title, subtitle, actions, align = "left", size = "lg" }: Props) => (
  <header className={cx(styles.header, styles[align], styles[size])}>
    <div>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </header>
);

export default PageHeader;
