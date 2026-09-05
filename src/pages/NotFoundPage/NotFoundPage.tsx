import PageTransition from "../../components/common/PageTransition";
import styles from "./NotFoundPage.module.scss";

const NotFoundPage = () => {
  return (
    <PageTransition>
      <div className={styles.errorContainer}>
        <h1 className={styles.errorCode}>404</h1>

        <div className={styles.messageBox}>
          <div className={styles.icon} aria-hidden="true">🚲💨</div>
          <h2>You've gone off-road!</h2>
          <p>
            The page you are looking for doesn't exist or has been moved to
            another garage.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFoundPage;
