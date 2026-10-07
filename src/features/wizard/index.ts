import type { Feature } from '../types';
import RegistrationWizard from './RegistrationWizard';

export const wizardFeature: Feature = {
  id: 'q3',
  path: 'wizard',
  title: 'Registration Wizard',
  tagline: 'A 3-step form with validation, a review step and refresh-safe progress.',
  Component: RegistrationWizard,
};
