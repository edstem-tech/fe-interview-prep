import TextField from './TextField';
import type { Wizard } from './useWizard';

export default function StepPersonal({ wizard }: { wizard: Wizard }) {
  const errors = wizard.showErrors ? wizard.errors : {};
  return (
    <div className="space-y-4">
      <TextField
        label="Full name"
        value={wizard.data.fullName}
        onChange={(v) => wizard.update('fullName', v)}
        error={errors.fullName}
        placeholder="Ada Lovelace"
      />
      <TextField
        label="Email"
        type="email"
        value={wizard.data.email}
        onChange={(v) => wizard.update('email', v)}
        error={errors.email}
        placeholder="ada@example.com"
      />
      <TextField
        label="Phone"
        type="tel"
        value={wizard.data.phone}
        onChange={(v) => wizard.update('phone', v)}
        error={errors.phone}
        placeholder="+91 98765 43210"
      />
    </div>
  );
}
