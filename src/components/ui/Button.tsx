import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cx } from "../../utils/cx";
import BusyLabel from "./BusyLabel";
import styles from "./Button.module.scss";

interface StyleProps {
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "success";
  // Large primary buttons are a page's main call to action and get the glow.
  size?: "sm" | "md" | "lg";
  block?: boolean;
  className?: string;
}

type ButtonProps = StyleProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    // While true the button is disabled and shows a spinner instead of its
    // label. Leave undefined on buttons that never wait on a request.
    busy?: boolean;
    // Announced to screen readers while busy, e.g. "Saving".
    busyText?: string;
  };

type LinkButtonProps = StyleProps & LinkProps;

// For the rare place outside the router, e.g. the error boundary.
type AnchorButtonProps = StyleProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const classes = ({ variant = "primary", size = "md", block, className }: StyleProps) =>
  cx(styles.btn, styles[variant], styles[size], block && styles.block, className);

// A <button>, or a router <Link> (given `to`) or plain anchor (given `href`)
// styled as one.
const Button = (props: ButtonProps | LinkButtonProps | AnchorButtonProps) => {
  if ("to" in props) {
    const { variant, size, block, className, ...link } = props;
    return <Link className={classes({ variant, size, block, className })} {...link} />;
  }

  if ("href" in props) {
    const { variant, size, block, className, ...anchor } = props;
    return <a className={classes({ variant, size, block, className })} {...anchor} />;
  }

  const {
    variant,
    size,
    block,
    className,
    busy,
    busyText = "Working",
    disabled,
    type = "button",
    children,
    ...button
  } = props;

  return (
    <button
      type={type}
      className={classes({ variant, size, block, className })}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...button}
    >
      {busy === undefined ? (
        children
      ) : (
        <BusyLabel busy={busy} busyText={busyText}>
          {children}
        </BusyLabel>
      )}
    </button>
  );
};

export default Button;
