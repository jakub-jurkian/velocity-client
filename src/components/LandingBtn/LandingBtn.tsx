import { Link } from "react-router-dom";
import styles from "./LandingBtn.module.scss";

// Extracted interface for clean type maintenance
interface LandingBtnProps {
  primary?: boolean;
  to?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function LandingBtn({
  primary,
  to = "/rent-bike",
  children = <>Start Riding</>,
  className = "",
}: LandingBtnProps) {
  return (
    <Link
      to={to}
      className={`${
        primary ? styles.primaryCta : styles.secondaryCta
      } ${className}`}
    >
      {children}
    </Link>
  );
}
