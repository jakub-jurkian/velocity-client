import { cx } from "../../utils/cx";
import styles from "./Logo.module.scss";

interface Props {
  size?: "sm" | "md" | "lg";
  // Trailing word after the wordmark, e.g. "Admin".
  suffix?: string;
}

// The "VeloCity" wordmark.
const Logo = ({ size = "md", suffix }: Props) => (
  <span className={cx(styles.logo, styles[size])}>
    Velo<span className={styles.highlight}>City</span>
    {suffix && <span className={styles.suffix}>{suffix}</span>}
  </span>
);

export default Logo;
