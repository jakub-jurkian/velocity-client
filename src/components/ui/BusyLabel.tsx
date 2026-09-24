import type { ReactNode } from "react";
import styles from "./BusyLabel.module.scss";

interface Props {
  busy: boolean;
  // Announced to screen readers while busy, e.g. "Saving".
  busyText: string;
  children: ReactNode;
}


//  Button content that swaps to a spinner while a request is in flight.
//  The idle label stays in the layout (just invisible) so the button keeps its
//  width instead of collapsing around the spinner. Pair it with `disabled` and
// `aria-busy` on the button itself.
const BusyLabel = ({ busy, busyText, children }: Props) => (
  <span className={styles.root}>
    <span className={busy ? styles.hidden : undefined} aria-hidden={busy || undefined}>
      {children}
    </span>
    {busy && (
      <>
        <span className={styles.spinner} aria-hidden="true" />
        <span className={styles.srOnly}>{busyText}…</span>
      </>
    )}
  </span>
);

export default BusyLabel;
