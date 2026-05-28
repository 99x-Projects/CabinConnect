/**
 * Client-side validation rules for sign-up. The server is authoritative —
 * these mirror what the API enforces so users get inline feedback before a
 * round-trip. Display-name length is bounded by the `users.display_name`
 * column (`varchar(100)`).
 */
const MIN_PASSWORD_LENGTH = 8;
const MAX_DISPLAY_NAME_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignUpInput {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
}

export interface SignUpValidationErrors {
  readonly email?: string;
  readonly password?: string;
  readonly displayName?: string;
}

export function validateSignUp(input: SignUpInput): SignUpValidationErrors {
  const errors: {
    email?: string;
    password?: string;
    displayName?: string;
  } = {};

  const trimmedEmail = input.email.trim();
  if (!trimmedEmail) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!input.password) {
    errors.password = 'Password is required.';
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${String(MIN_PASSWORD_LENGTH)} characters.`;
  }

  const trimmedName = input.displayName.trim();
  if (!trimmedName) {
    errors.displayName = 'Display name is required.';
  } else if (trimmedName.length > MAX_DISPLAY_NAME_LENGTH) {
    errors.displayName = `Display name must be ${String(MAX_DISPLAY_NAME_LENGTH)} characters or fewer.`;
  }

  return errors;
}

export const SignUpValidation = {
  MIN_PASSWORD_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
};
