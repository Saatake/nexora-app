export type PasswordRequirement = {
  label: string;
  test: (password: string) => boolean;
};

export const passwordRequirements: PasswordRequirement[] = [
  { label: 'No mínimo 6 caracteres', test: (p) => p.length >= 6 },
  { label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Um número', test: (p) => /\d/.test(p) },
  { label: 'Um símbolo', test: (p) => /[^A-Za-z0-9]/.test(p) },
];
