import type { Wizard } from './useWizard';

interface Row {
  label: string;
  value: string;
}

function Section({ title, rows, onEdit }: { title: string; rows: Row[]; onEdit: () => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          Edit
        </button>
      </div>
      <dl className="mt-2 grid grid-cols-[8rem_1fr] gap-x-4 gap-y-1 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="text-slate-800">{row.value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ReviewStep({ wizard }: { wizard: Wizard }) {
  const { data } = wizard;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Review your details, then submit.</p>
      <Section
        title="Personal"
        onEdit={() => wizard.goTo(0)}
        rows={[
          { label: 'Full name', value: data.fullName },
          { label: 'Email', value: data.email },
          { label: 'Phone', value: data.phone },
        ]}
      />
      <Section
        title="Address"
        onEdit={() => wizard.goTo(1)}
        rows={[
          { label: 'Country', value: data.country },
          { label: 'City', value: data.city },
          { label: 'Postal code', value: data.postalCode },
        ]}
      />
      <Section
        title="Preferences"
        onEdit={() => wizard.goTo(2)}
        rows={[
          { label: 'Plan', value: data.plan },
          { label: 'Skills', value: data.skills.join(', ') },
        ]}
      />
    </div>
  );
}
