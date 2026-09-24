import { useState, type ChangeEvent, type FormEvent } from "react";

type Errors<T> = Partial<Record<keyof T, string>>;

interface UseFormProps<T> {
  initialValues: T;
  validate: (values: T) => Errors<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export const useForm = <T extends Record<string, string | boolean>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // One handler for every input, select and checkbox, keyed by `name`. Editing
  // a field clears its error.
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { target } = e;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;

    setValues((prev) => ({ ...prev, [target.name]: value }));
    setErrors((prev) =>
      prev[target.name as keyof T] ? { ...prev, [target.name]: undefined } : prev,
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Props for a TextField or SelectField bound to `name`.
  const field = (name: keyof T & string) => ({
    name,
    value: String(values[name]),
    onChange: handleChange,
    error: errors[name],
  });

  // Props for a CheckboxField bound to `name`.
  const checkbox = (name: keyof T & string) => ({
    name,
    checked: Boolean(values[name]),
    onChange: handleChange,
    error: errors[name],
  });

  // Replaces every value and clears the errors, e.g. to seed an edit form.
  const reset = (next: T) => {
    setValues(next);
    setErrors({});
  };

  // setErrors is exposed so a submit handler can attach a server-side failure
  // to the field it belongs to. Without it a 409 on email has nowhere to go
  // but a toast, which leaves the offending input unmarked.
  return { values, errors, isSubmitting, handleSubmit, setErrors, field, checkbox, reset };
};
