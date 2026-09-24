import type { MouseEvent } from "react";
import styles from "./SkipLink.module.scss";

export const MAIN_CONTENT_ID = "main-content";

// The first stop for keyboard users: jumps past the navigation to the page
// itself. Off screen until focused. Moves focus directly rather than
// following the hash, so the URL stays clean.
const SkipLink = () => {
  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById(MAIN_CONTENT_ID)?.focus();
  };

  return (
    <a href={`#${MAIN_CONTENT_ID}`} className={styles.skip} onClick={skip}>
      Skip to content
    </a>
  );
};

export default SkipLink;
