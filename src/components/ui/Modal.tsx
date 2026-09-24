import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./Modal.module.scss";

interface Props {
  title: ReactNode;
  onClose: () => void;
  // Blocks Escape and backdrop clicks while a request is in flight: closing
  // then would leave the user unsure whether it landed.
  locked?: boolean;
  description?: ReactNode;
  // Buttons along the bottom, sharing the width equally.
  actions?: ReactNode;
  children?: ReactNode;
  size?: "sm" | "md";
  // Edge colour: "danger" for destructive steps, "primary" to mark an admin.
  tone?: "danger" | "primary";
  role?: "dialog" | "alertdialog";
}

// Rendered only while open: mount it conditionally.
const Modal = ({
  title,
  onClose,
  locked = false,
  description,
  actions,
  children,
  size = "sm",
  tone,
  role = "dialog",
}: Props) => {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  // Focus the dialog so screen readers announce it and Escape works at once.
  useEffect(() => {
    panel.current?.focus();
  }, []);

  // The page behind stays put while the dialog is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !locked) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [locked, onClose]);

  return (
    <div className={styles.overlay} onClick={() => !locked && onClose()}>
      <div
        ref={panel}
        className={cx(styles.modal, styles[size], tone && styles[tone])}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
        {children}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
