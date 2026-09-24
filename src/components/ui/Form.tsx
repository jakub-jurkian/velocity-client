import {
  useId,
  type FormHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cx } from "../../utils/cx";
import styles from "./Form.module.scss";

// A form whose fields stack with even spacing.
export const Form = ({ className, ...form }: FormHTMLAttributes<HTMLFormElement>) => (
  <form className={cx(styles.form, className)} {...form} />
);

// Two fields side by side from tablet width up.
export const FieldRow = ({ children }: { children: ReactNode }) => (
  <div className={styles.row}>{children}</div>
);

interface FieldProps {
  label: ReactNode;
  error?: string;
  className?: string;
}

// Wires the label to the control and the error to aria-describedby, so a
// screen reader reads the message when the field is focused.
const useFieldIds = (id?: string) => {
  const fallback = useId();
  const fieldId = id ?? fallback;
  return { fieldId, errorId: `${fieldId}-error` };
};

const controlProps = (fieldId: string, errorId: string, error?: string) => ({
  id: fieldId,
  className: cx(styles.control, error && styles.invalid),
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? errorId : undefined,
});

const FieldError = ({ id, error }: { id: string; error?: string }) =>
  error ? (
    <span id={id} className={styles.error}>
      {error}
    </span>
  ) : null;

export const TextField = ({
  label,
  error,
  className,
  id,
  ...input
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) => {
  const { fieldId, errorId } = useFieldIds(id);
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={fieldId}>{label}</label>
      <input {...controlProps(fieldId, errorId, error)} {...input} />
      <FieldError id={errorId} error={error} />
    </div>
  );
};

export const SelectField = ({
  label,
  error,
  className,
  id,
  options,
  ...select
}: FieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: readonly { value: string; label: string }[];
  }) => {
  const { fieldId, errorId } = useFieldIds(id);
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={fieldId}>{label}</label>
      <div className={styles.selectWrap}>
        <select {...controlProps(fieldId, errorId, error)} {...select}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
};

export const CheckboxField = ({
  label,
  error,
  className,
  id,
  ...input
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) => {
  const { fieldId, errorId } = useFieldIds(id);
  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...input}
        />
        <span>{label}</span>
      </label>
      <FieldError id={errorId} error={error} />
    </div>
  );
};

// A value shown in a field's place when it cannot be edited, laid out like
// the input it stands in for so switching modes does not move anything.
export const ReadOnlyField = ({
  label,
  className,
  children,
}: Omit<FieldProps, "error"> & { children: ReactNode }) => (
  <div className={styles.field}>
    <span className={styles.label}>{label}</span>
    <div className={cx(styles.readOnly, className)}>{children}</div>
  </div>
);
