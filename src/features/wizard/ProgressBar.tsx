const STEP_LABELS = ['Personal', 'Address', 'Preferences', 'Review'] as const;

interface ProgressBarProps {
  current: number;
}

export default function ProgressBar({ current }: ProgressBarProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {STEP_LABELS.map((label, index) => {
        const state =
          index < current ? 'done' : index === current ? 'current' : 'upcoming';
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={state === 'current' ? 'step' : undefined}
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                state === 'done'
                  ? 'bg-indigo-600 text-white'
                  : state === 'current'
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`text-sm ${state === 'upcoming' ? 'text-slate-400' : 'text-slate-700'}`}
            >
              {label}
            </span>
            {index < STEP_LABELS.length - 1 && (
              <span className="mx-1 hidden h-px flex-1 bg-slate-200 sm:block" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
