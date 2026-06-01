const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_FULL_NAME_LENGTH = 2;

export interface LoginValidationInput {
  email: string;
  password: string;
}

export interface RegisterValidationInput extends LoginValidationInput {
  fullName: string;
}

export interface LoginValidationErrors {
  email?: string;
  password?: string;
}

export interface RegisterValidationErrors extends LoginValidationErrors {
  fullName?: string;
}

export function validateLoginForm(input: LoginValidationInput): LoginValidationErrors {
  const errors: LoginValidationErrors = {};
  const email = input.email.trim();

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!input.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function validateRegisterForm(input: RegisterValidationInput): RegisterValidationErrors {
  const errors: RegisterValidationErrors = {
    ...validateLoginForm(input),
  };
  const fullName = input.fullName.trim();

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < MIN_FULL_NAME_LENGTH) {
    errors.fullName = 'Full name is too short.';
  }

  if (input.password && input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}

export function hasValidationErrors(errors: LoginValidationErrors | RegisterValidationErrors) {
  return Object.values(errors).some(Boolean);
}
