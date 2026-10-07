export const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Australia', 'Germany'] as const;
export type Country = (typeof COUNTRIES)[number];

export const PLANS = ['Free', 'Pro', 'Team'] as const;
export type Plan = (typeof PLANS)[number];

export interface WizardData {
  // Step 1 — personal
  fullName: string;
  email: string;
  phone: string;
  // Step 2 — address
  country: Country | '';
  city: string;
  postalCode: string;
  // Step 3 — preferences
  plan: Plan | '';
  skills: string[];
}

export const EMPTY_DATA: WizardData = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  postalCode: '',
  plan: '',
  skills: [],
};

/** Validation errors keyed by field name. A field is only present when invalid. */
export type Errors = Partial<Record<keyof WizardData, string>>;

export const STEP_COUNT = 3;
