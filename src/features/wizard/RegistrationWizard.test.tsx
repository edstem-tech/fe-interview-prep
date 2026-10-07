import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationWizard from './RegistrationWizard';

async function fillPersonal() {
  await userEvent.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
  await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
  await userEvent.type(screen.getByLabelText('Phone'), '9876543210');
}

describe('RegistrationWizard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('blocks advancing an invalid step and shows errors', async () => {
    render(<RegistrationWizard />);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Still on step 1, with field errors shown.
    expect(screen.getByRole('heading', { name: 'Personal information' })).toBeInTheDocument();
    expect(screen.getByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
  });

  it('advances once the step is valid', async () => {
    render(<RegistrationWizard />);
    await fillPersonal();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Address' })).toBeInTheDocument();
  });

  it('requires a 6-digit postal code for India only', async () => {
    render(<RegistrationWizard />);
    await fillPersonal();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    await userEvent.selectOptions(screen.getByLabelText('Country'), 'India');
    await userEvent.type(screen.getByLabelText('City'), 'Chennai');
    await userEvent.type(screen.getByLabelText('Postal code'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(/exactly 6 digits/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Postal code'), '56');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Preferences' })).toBeInTheDocument();
  });

  it('keeps entered values when going back', async () => {
    render(<RegistrationWizard />);
    await fillPersonal();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
  });

  it('completes the flow and shows a success message', async () => {
    render(<RegistrationWizard />);
    await fillPersonal();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    await userEvent.selectOptions(screen.getByLabelText('Country'), 'Australia');
    await userEvent.type(screen.getByLabelText('City'), 'Sydney');
    await userEvent.type(screen.getByLabelText('Postal code'), '2000');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    await userEvent.click(screen.getByRole('radio', { name: 'Pro' }));
    await userEvent.type(screen.getByLabelText('Add a skill'), 'React');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Review step shows a Submit button and the entered skill.
    const submit = screen.getByRole('button', { name: 'Submit' });
    expect(screen.getByText('React')).toBeInTheDocument();
    await userEvent.click(submit);

    expect(await screen.findByText(/you're registered/i)).toBeInTheDocument();
  });
});
