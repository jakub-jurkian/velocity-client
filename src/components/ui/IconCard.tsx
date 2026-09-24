import type { ReactNode } from "react";
import styles from "./IconCard.module.scss";

interface Props {
  icon: string;
  title: string;
  children: ReactNode;
  // The level that follows the section's own heading: h3 under an h2, h2
  // straight under the page's h1, so the outline never skips a level.
  headingLevel?: 2 | 3;
}

// A centred card led by an emoji icon: feature lists, contact details.
const IconCard = ({ icon, title, children, headingLevel = 3 }: Props) => {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className={styles.card}>
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
      <Heading className={styles.title}>{title}</Heading>
      <div className={styles.body}>{children}</div>
    </article>
  );
};

export default IconCard;
