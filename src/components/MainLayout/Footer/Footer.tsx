import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <Link to="/about">About VeloCity</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <p className={styles.copyright}>
        © 2026 VeloCity Inc. All rights reserved.
      </p>
    </footer>
  );
}
