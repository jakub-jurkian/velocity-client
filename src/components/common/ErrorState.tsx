import PageTransition from "./PageTransition";
import styles from "./ErrorState.module.scss";

interface Props {
  code: string;
  icon: string;
  title: string;
  message: string;
}
// Shared layout for the 404 and 403 pages. Both render inside MainLayout, so
// the navbar is the way onward and no call-to-action is needed here.
const ErrorState = ({ code, icon, title, message }: Props) => (
  <PageTransition>
    <div className={styles.errorContainer}>
      <h1 className={styles.errorCode}>{code}</h1>

      <div className={styles.messageBox}>
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  </PageTransition>
);

export default ErrorState;
