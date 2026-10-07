import { useState, type FormEvent } from 'react';
import { PLANS, type Plan } from './types';
import type { Wizard } from './useWizard';

export default function StepPreferences({ wizard }: { wizard: Wizard }) {
  const errors = wizard.showErrors ? wizard.errors : {};
  const [skillDraft, setSkillDraft] = useState('');

  function handleAddSkill(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    wizard.addSkill(skillDraft);
    setSkillDraft('');
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Plan</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <label
              key={plan}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-center transition ${
                wizard.data.plan === plan
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={plan}
                checked={wizard.data.plan === plan}
                onChange={() => wizard.update('plan', plan as Plan)}
                className="sr-only"
              />
              {plan}
            </label>
          ))}
        </div>
        {errors.plan && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.plan}
          </p>
        )}
      </fieldset>

      <div>
        <span className="block text-sm font-medium text-slate-700">Skills</span>
        <form onSubmit={handleAddSkill} className="mt-2 flex gap-2">
          <input
            aria-label="Add a skill"
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            placeholder="e.g. React"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            disabled={skillDraft.trim() === ''}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            Add
          </button>
        </form>

        {wizard.data.skills.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {wizard.data.skills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => wizard.removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="flex size-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-300 hover:text-slate-800"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.skills && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.skills}
          </p>
        )}
      </div>
    </div>
  );
}
