// Keeps only the checks that failed, so a form's validate() can list every
// field in one object: collectErrors({ email: validateEmail(v.email), ... }).
export const collectErrors = <K extends string>(checks: Record<K, string | undefined>) =>
  Object.fromEntries(
    Object.entries(checks).filter(([, message]) => message),
  ) as Partial<Record<K, string>>;

// Checks for a valid email format using regex.
export const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required";

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
  fieldLabel: string,
): string | undefined => {
  if (!value) return `${fieldLabel} is required`;
  if (value.length < min) {
    return `${fieldLabel} must be at least ${min} characters`;
  }
  return undefined;
};

// Mirrors the backend E.164 constraint: `User.PHONE_PATTERN` and the `@Pattern`
// on the three request records, all of which use `^\+[1-9]\d{7,14}$`.
// The `+` is required and there are at least 8 digits. The old `\+?` and
// `\d{1,14}` had no floor, so this accepted "+48" and the API rejected it.
// Duplicated from the backend with nothing keeping the two in step - change both.
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export const validatePhone = (phone: string): string | undefined => {
  const trimmed = (phone || "").trim();

  if (!trimmed) return "Phone number is required";

  if (!E164_PATTERN.test(trimmed)) {
    return "Use international format without spaces, e.g. +48123456789";
  }
  return undefined;
};

// Mirrors the `@Pattern` on `UserRegistrationRequest.password`, which is where
// the rule is actually enforced — this copy only saves the user a round trip.
// Duplicated from the backend with nothing keeping the two in step - change both.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;

export const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required";

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`;
  }

  if (!PASSWORD_PATTERN.test(password)) {
    return "Password needs an uppercase letter, a lowercase letter, a digit and a special character";
  }
  return undefined;
};
