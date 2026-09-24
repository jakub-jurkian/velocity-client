import { Component, type ErrorInfo, type ReactNode } from "react";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import styles from "./ErrorBoundary.module.scss";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Catches render-time errors anywhere below it and shows a recoverable screen
// instead of letting React unmount the whole tree to a blank page.

// A class, because `componentDidCatch` has no hook equivalent — this is the one
// React feature that still requires one.

// Mounted outside the store and the router so it also covers a failure in
// either, which means the fallback cannot navigate with `useNavigate`. It uses
// a plain anchor instead, and the resulting full page load is the better
// recovery anyway: whatever state caused the crash is discarded with it.

// Note it does NOT catch errors thrown inside event handlers or async code —
// React only routes render, lifecycle and constructor errors here. The `fetch`
// calls across the app keep their own try/catch for that reason.

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // The single place to wire an error reporter (Sentry et al) if one is ever
    // added. Until then the console is the only sink, which is why the stack
    // is logged rather than just the message.
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className={styles.container} role="alert">
        <div className={styles.card}>
          <Logo size="sm" />
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.body}>
            This page hit an unexpected error. Reloading usually clears it — if
            it keeps happening, please let us know.
          </p>
          <div className={styles.actions}>
            <Button href="/">Back to home</Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
