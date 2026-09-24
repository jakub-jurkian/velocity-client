import { cx } from "../../utils/cx";
import styles from "./BurgerButton.module.scss";

interface Props {
  open: boolean;
  onToggle: () => void;
}

// Three bars that fold into an X. Phones and small tablets only.
const BurgerButton = ({ open, onToggle }: Props) => (
  <button
    type="button"
    className={cx(styles.burger, open && styles.open)}
    onClick={onToggle}
    aria-label="Toggle navigation menu"
    aria-expanded={open}
  >
    <span aria-hidden="true" />
    <span aria-hidden="true" />
    <span aria-hidden="true" />
  </button>
);

export default BurgerButton;
