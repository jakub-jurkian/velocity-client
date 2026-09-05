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


// Checks if a phone number contains only digits/spaces/+ and is reasonable length.
export const validatePhone = (phone: string): string | undefined => {
  if (!phone) return undefined; // Optional field usually, remove if required

  const regex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!regex.test(phone)) {
    return "Invalid phone number format";
  }
  return undefined;
};
