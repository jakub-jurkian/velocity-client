// Joins class names, dropping the falsy ones: cx(styles.a, isOpen && styles.open).
export const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");
