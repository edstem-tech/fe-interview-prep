import { useId } from 'react';
import TextField from './TextField';
import { COUNTRIES, type Country } from './types';
import type { Wizard } from './useWizard';

export default function StepAddress({ wizard }: { wizard: Wizard }) {
  const errors = wizard.showErrors ? wizard.errors : {};
  const selectId = useId();
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
          Country
        </label>
        <select
          id={selectId}
          value={wizard.data.country}
          onChange={(e) => wizard.update('country', e.target.value as Country | '')}
          aria-invalid={errors.country ? true : undefined}
          className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 ${
            errors.country
              ? 'border-red-400 focus:ring-red-200'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
          }`}
        >
          <option value="">Select a country…</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {errors.country && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.country}
          </p>
        )}
      </div>

      <TextField
        label="City"
        value={wizard.data.city}
        onChange={(v) => wizard.update('city', v)}
        error={errors.city}
      />
      <TextField
        label="Postal code"
        value={wizard.data.postalCode}
        onChange={(v) => wizard.update('postalCode', v)}
        error={errors.postalCode}
        placeholder={wizard.data.country === 'India' ? '6 digits' : undefined}
      />
    </div>
  );
}
