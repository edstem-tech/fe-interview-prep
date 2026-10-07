import { useCallback, useMemo, useState } from 'react';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { EMPTY_DATA, STEP_COUNT, type Errors, type WizardData } from './types';
import { isStepValid, validateStep } from './validation';

export type SubmitStatus = 'editing' | 'submitting' | 'success';

export interface Wizard {
  data: WizardData;
  /** 0..2 are the form steps; STEP_COUNT (3) is the review step. */
  step: number;
  errors: Errors;
  /** Whether the current step's errors should be shown (after a failed Next). */
  showErrors: boolean;
  status: SubmitStatus;
  isReview: boolean;
  update: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  next: () => void;
  back: () => void;
  goTo: (step: number) => void;
  submit: () => void;
  reset: () => void;
}

/**
 * Owns the wizard's data and position. Both are persisted to localStorage so a
 * mid-way refresh restores progress. Advancing is gated: `next()` reveals the
 * current step's errors and only moves forward when the step validates. Errors are
 * computed from the shared `validateStep`, never stored, so they can't go stale.
 */
export function useWizard(keyPrefix = 'q3.wizard'): Wizard {
  const [data, setData] = useLocalStorage<WizardData>(`${keyPrefix}.data`, EMPTY_DATA);
  const [step, setStep] = useLocalStorage<number>(`${keyPrefix}.step`, 0);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>('editing');

  const isReview = step >= STEP_COUNT;
  const errors = useMemo(() => (isReview ? {} : validateStep(step, data)), [isReview, step, data]);

  const update = useCallback<Wizard['update']>(
    (field, value) => setData((prev) => ({ ...prev, [field]: value })),
    [setData],
  );

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (!trimmed) return;
      setData((prev) =>
        prev.skills.includes(trimmed) ? prev : { ...prev, skills: [...prev.skills, trimmed] },
      );
    },
    [setData],
  );

  const removeSkill = useCallback(
    (skill: string) => {
      setData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
    },
    [setData],
  );

  const next = useCallback(() => {
    if (!isStepValid(step, data)) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    setStep((prev) => prev + 1);
  }, [step, data, setStep]);

  const back = useCallback(() => {
    setRevealed(false);
    setStep((prev) => Math.max(0, prev - 1));
  }, [setStep]);

  const goTo = useCallback(
    (target: number) => {
      setRevealed(false);
      setStep(target);
    },
    [setStep],
  );

  const submit = useCallback(() => {
    setStatus('submitting');
    // Simulate an API round-trip.
    window.setTimeout(() => setStatus('success'), 800);
  }, []);

  const reset = useCallback(() => {
    setData(EMPTY_DATA);
    setStep(0);
    setRevealed(false);
    setStatus('editing');
  }, [setData, setStep]);

  return {
    data,
    step,
    errors,
    showErrors: revealed,
    status,
    isReview,
    update,
    addSkill,
    removeSkill,
    next,
    back,
    goTo,
    submit,
    reset,
  };
}
