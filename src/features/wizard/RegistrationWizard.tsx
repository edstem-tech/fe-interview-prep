import { useWizard } from './useWizard';
import ProgressBar from './ProgressBar';
import StepPersonal from './StepPersonal';
import StepAddress from './StepAddress';
import StepPreferences from './StepPreferences';
import ReviewStep from './ReviewStep';

const STEP_TITLES = ['Personal information', 'Address', 'Preferences'] as const;

export default function RegistrationWizard() {
  const wizard = useWizard();

  if (wizard.status === 'success') {
    return (
      <section className="mx-auto max-w-xl text-center">
        <div className="rounded-xl border border-green-200 bg-green-50 p-8">
          <h1 className="text-2xl font-bold text-green-800">You're registered 🎉</h1>
          <p className="mt-2 text-green-700">
            Thanks, {wizard.data.fullName || 'friend'} — your {wizard.data.plan} plan is ready.
          </p>
          <button
            type="button"
            onClick={wizard.reset}
            className="mt-6 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
          >
            Start over
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Registration Wizard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Three steps with validation and a review. Progress survives a refresh.
      </p>

      <div className="mt-6">
        <ProgressBar current={wizard.step} />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        {!wizard.isReview && (
          <h2 className="mb-4 text-lg font-semibold">{STEP_TITLES[wizard.step]}</h2>
        )}
        {wizard.step === 0 && <StepPersonal wizard={wizard} />}
        {wizard.step === 1 && <StepAddress wizard={wizard} />}
        {wizard.step === 2 && <StepPreferences wizard={wizard} />}
        {wizard.isReview && <ReviewStep wizard={wizard} />}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={wizard.back}
          disabled={wizard.step === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
        >
          Back
        </button>

        {wizard.isReview ? (
          <button
            type="button"
            onClick={wizard.submit}
            disabled={wizard.status === 'submitting'}
            className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            {wizard.status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        ) : (
          <button
            type="button"
            onClick={wizard.next}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
          >
            Next
          </button>
        )}
      </div>
    </section>
  );
}
