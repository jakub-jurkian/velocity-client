import type { ReactNode } from "react";
import Button from "./Button";
import Modal from "./Modal";

interface Props {
  title: ReactNode;
  // The question itself, shown under the title.
  message: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  busyText?: string;
  // "danger" for anything destructive; "primary" for a benign confirmation.
  tone?: "danger" | "primary";
  // Extra detail between the message and the buttons, e.g. affected records.
  children?: ReactNode;
}

// A yes/no question in a modal. Neither button nor Escape works mid-request.
const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  busy = false,
  busyText = "Working",
  tone = "danger",
  children,
}: Props) => (
  <Modal
    title={title}
    description={message}
    onClose={onCancel}
    locked={busy}
    tone={tone === "danger" ? "danger" : undefined}
    role="alertdialog"
    actions={
      <>
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={tone} onClick={onConfirm} busy={busy} busyText={busyText}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    {children}
  </Modal>
);

export default ConfirmDialog;
