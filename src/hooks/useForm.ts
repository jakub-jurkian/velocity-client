import { useState, type ChangeEvent, type FormEvent } from "react";

// Define the shape of the validation function
type ValidationFunction<T> = (values: T) => Partial<Record<keyof T, string>>;

interface UseFormProps<T> {
  initialValues: T;
  validate: ValidationFunction<T>;
  onSubmit: (values: T) => Promise<void> | void; // Supports async
}

export const useForm = <T extends Record<string, string | number | boolean>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormProps<T>) => {
  // State for form data
  const [values, setValues] = useState<T>(initialValues);

  // State for errors
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // State for loading (disable button while submitting)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic Change Handler (Works for ANY input)
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const isCheckbox = type === 'checkbox';
    
  // @ts-expect-error for
  const finalValue = isCheckbox ? e.target.checked : value;

  setValues((prev) => ({
    ...prev,
    [name]: finalValue,
  }));

  if (errors[name as keyof T]) {
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }
  };

  // The "Gatekeeper" Function
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Run Validation
    const validationErrors = validate(values);

    // Check results
    if (Object.keys(validationErrors).length === 0) {
      // Success: No errors, call the API
      await onSubmit(values);
    } else {
      // Failure: Save errors to display
      setErrors(validationErrors);
    }

    setIsSubmitting(false);
  };

  // setErrors is exposed so a submit handler can attach a server-side failure
  // to the field it belongs to. Without it a 409 on email has nowhere to go
  // but a toast, which leaves the offending input unmarked.
  return { values, errors, isSubmitting, handleChange, handleSubmit, setErrors };
};
