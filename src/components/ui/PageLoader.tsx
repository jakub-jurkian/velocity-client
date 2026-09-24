import SlowNotice from "./SlowNotice";
import styles from "./PageLoader.module.scss";

// A centred spinner for a page or step that is waiting on data.
const PageLoader = ({ label }: { label?: string }) => (
  <div className={styles.loader}>
    <div className={styles.spinner} aria-hidden="true" />
    <p className={label ? styles.label : styles.srOnly} role="status">
      {label ?? "Loading…"}
    </p>
    <SlowNotice />
  </div>
);

export default PageLoader;
