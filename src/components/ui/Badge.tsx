import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./Badge.module.scss";

// "accent" is a solid brand-purple fill; the rest are tints.
export type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "info" | "neutral";

interface Props {
  tone?: Tone;
  // Every fixed badge is as wide as the longest label, so a column of them
  // reads as a clean stack.
  fixed?: boolean;
  children: ReactNode;
}

// A small tinted pill for a role, status or discount.
const Badge = ({ tone = "neutral", fixed = false, children }: Props) => (
  <span className={cx(styles.badge, styles[tone], fixed && styles.fixed)}>{children}</span>
);

export default Badge;
