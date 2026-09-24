import { useId, type ReactNode } from "react";
import PageTransition from "../common/PageTransition";
import Logo from "../ui/Logo";
import { cx } from "../../utils/cx";
import styles from "./AuthLayout.module.scss";

interface Props {
  title: string;
  subtitle: string;
  // Under the form, e.g. the link across to the other auth page.
  footer: ReactNode;
  children: ReactNode;
  // Room for two fields side by side.
  wide?: boolean;
  glow?: "primary" | "secondary";
}

// The frosted card on a glowing backdrop shared by log in and register.
const AuthLayout = ({ title, subtitle, footer, children, wide = false, glow = "primary" }: Props) => {
  const titleId = useId();

  return (
    <PageTransition>
      <main className={styles.container}>
        <div className={cx(styles.glow, styles[glow])} aria-hidden="true" />

        <section className={cx(styles.card, wide && styles.wide)} aria-labelledby={titleId}>
          <header className={styles.header}>
            <Logo size="lg" />
            <h1 id={titleId} className={styles.title}>
              {title}
            </h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </header>

          {children}

          <footer className={styles.footer}>{footer}</footer>
        </section>
      </main>
    </PageTransition>
  );
};

export default AuthLayout;
