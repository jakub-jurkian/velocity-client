import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <Link to="/about">About VeloCity</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <p className={styles.copyright}>
        © {currentYear} VeloCity Inc. All rights reserved.
      </p>
    </footer>
  );
}
