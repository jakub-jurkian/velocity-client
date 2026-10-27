import { Link } from "react-router-dom";
import { cx } from "../../utils/cx";
import styles from "./BackLink.module.scss";

interface Props {
  to?: string;
  label?: string;
  className?: string;
}

// Leads up to the parent page rather than back through history: after a
// booking, history would land the rider in the rental wizard again.
const BackLink = ({ to = "/dashboard", label = "Dashboard", className }: Props) => (
  <Link to={to} className={cx(styles.back, className)}>
    <span aria-hidden="true">←</span> {label}
  </Link>
);

export default BackLink;
