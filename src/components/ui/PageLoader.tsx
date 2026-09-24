import styles from "./PageLoader.module.scss";

// A centred spinner for a page or step that is waiting on data.
const PageLoader = ({ label }: { label?: string }) => (
  <div className={styles.loader} role="status">
    <div className={styles.spinner} aria-hidden="true" />
    <p className={label ? styles.label : styles.srOnly}>{label ?? "Loading…"}</p>
  </div>
);

export default PageLoader;
