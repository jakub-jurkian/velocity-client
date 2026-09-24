import { useEffect, useState } from "react";
import styles from "./SlowNotice.module.scss";

// Mount it only while something is pending. It stays invisible for quick
// responses and explains a long wait, e.g. an API restarting or a slow
// network, so a stalled spinner does not read as a broken site.
const SlowNotice = ({ after = 4000 }: { after?: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), after);
    return () => clearTimeout(timer);
  }, [after]);

  if (!visible) return null;

  return (
    <p className={styles.notice} role="status">
      This is taking longer than usual. The server may be busy or starting up, so hang
      on a moment.
    </p>
  );
};

export default SlowNotice;
