const translateIdentityError = (item: string): string => {
  if (item.includes('is already taken')) return 'Este e-mail já está cadastrado.';
  if (item.includes('Passwords must have at least one non alphanumeric character'))
    return 'A senha precisa ter pelo menos 1 símbolo.';
  if (item.includes('Passwords must have at least one lowercase'))
    return 'A senha precisa ter pelo menos 1 letra minúscula.';
  if (item.includes('Passwords must have at least one uppercase'))
    return 'A senha precisa ter pelo menos 1 letra maiúscula.';
  if (item.includes('Passwords must have at least one digit'))
    return 'A senha precisa ter pelo menos 1 número.';
  if (item.includes('Passwords must be at least'))
    return 'A senha precisa ter no mínimo 6 caracteres.';
  if (item.includes('Invalid token'))
    return 'Link inválido ou expirado. Solicite um novo link de recuperação.';
  return item;
};

export const getErrorMessage = (
  err: unknown,
  fallback: string,
): string => {
  const data = (err as { response?: { data?: { message?: string; errors?: unknown } } })
    ?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return Array.from(new Set((data.errors as string[]).map(translateIdentityError))).join(', ');
  }
  if (data?.errors && typeof data.errors === 'object') {
    const flat = Object.values(data.errors as Record<string, string[]>).flat();
    if (flat.length > 0) {
      return Array.from(new Set(flat.map(translateIdentityError))).join(', ');
    }
  }
  if (typeof data?.message === 'string' && data.message.trim().length > 0) {
    return data.message;
  }
  return fallback;
};
