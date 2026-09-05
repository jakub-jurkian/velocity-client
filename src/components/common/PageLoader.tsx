import styles from "./PageLoader.module.scss";

const PageLoader = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner} role="status" aria-label="Loading page..."></div>
    </div>
  );
};

export default PageLoader;
