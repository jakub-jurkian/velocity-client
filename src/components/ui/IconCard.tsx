import type { ReactNode } from "react";
import styles from "./IconCard.module.scss";

interface Props {
  icon: string;
  title: string;
  children: ReactNode;
}

// A centred card led by an emoji icon: feature lists, contact details.
const IconCard = ({ icon, title, children }: Props) => (
  <article className={styles.card}>
    <div className={styles.icon} aria-hidden="true">
      {icon}
    </div>
    <h3 className={styles.title}>{title}</h3>
    <div className={styles.body}>{children}</div>
  </article>
);

export default IconCard;
