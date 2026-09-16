// Checks if a value is empty or just whitespace.
export const validateRequired = (
  value: string,
  fieldLabel: string
): string | undefined => {
  if (!value || value.trim() === "") {
    return `${fieldLabel} is required`;
  }
  return undefined;
};

// Checks for a valid email format using regex.
export const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required";

  // Standard email regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined;
};

// Enforces minimum length (good for passwords).
export const validateMinLength = (
  value: string,
  min: number,
  fieldLabel: string
): string | undefined => {
  if (!value) return `${fieldLabel} is required`;
  if (value.length < min) {
    return `${fieldLabel} must be at least ${min} characters`;
  }
  return undefined;
};


/**
 * Mirrors the backend E.164 constraint exactly: the `@Pattern` on
 * `UserRegistrationRequest.phone` and `User.normalizeAndValidatePhone`, both
 * of which use `^\+?[1-9]\d{1,14}$`.
 *
 * The previous pattern allowed spaces, dots, dashes and parentheses that the
 * API rejects, so a number the form accepted could still fail server-side.
 * Phone is also required, not optional: the backend marks it `@NotBlank`.
 */
const E164_PATTERN = /^\+?[1-9]\d{1,14}$/;

export const validatePhone = (phone: string): string | undefined => {
  const trimmed = (phone || "").trim();

  if (!trimmed) return "Phone number is required";

  if (!E164_PATTERN.test(trimmed)) {
    return "Use international format without spaces, e.g. +48123456789";
  }
  return undefined;
};
