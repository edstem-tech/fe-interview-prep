import type { Errors, WizardData } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{7,}$/;

/**
 * Validates a single step and returns the errors for just that step's fields.
 * Kept pure (data in, errors out) so both the gate between steps and the inline
 * field errors read from the same source of truth.
 */
export function validateStep(step: number, data: WizardData): Errors {
  switch (step) {
    case 0:
      return validatePersonal(data);
    case 1:
      return validateAddress(data);
    case 2:
      return validatePreferences(data);
    default:
      return {};
  }
}

export function isStepValid(step: number, data: WizardData): boolean {
  return Object.keys(validateStep(step, data)).length === 0;
}

function validatePersonal(data: WizardData): Errors {
  const errors: Errors = {};
  if (!data.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!data.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(data.email.trim())) errors.email = 'Enter a valid email address.';
  if (!data.phone.trim()) errors.phone = 'Phone is required.';
  else if (!PHONE_RE.test(data.phone.trim())) errors.phone = 'Enter a valid phone number.';
  return errors;
}

function validateAddress(data: WizardData): Errors {
  const errors: Errors = {};
  if (!data.country) errors.country = 'Select a country.';
  if (!data.city.trim()) errors.city = 'City is required.';
  if (!data.postalCode.trim()) {
    errors.postalCode = 'Postal code is required.';
  } else if (data.country === 'India' && !/^\d{6}$/.test(data.postalCode.trim())) {
    errors.postalCode = 'Indian postal codes must be exactly 6 digits.';
  }
  return errors;
}

function validatePreferences(data: WizardData): Errors {
  const errors: Errors = {};
  if (!data.plan) errors.plan = 'Choose a plan.';
  if (data.skills.length === 0) errors.skills = 'Add at least one skill.';
  return errors;
}
