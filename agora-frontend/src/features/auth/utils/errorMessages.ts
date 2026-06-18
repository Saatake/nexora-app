export const getErrorMessage = (
  err: unknown,
  fallback: string,
): string => {
  const data = (err as { response?: { data?: { message?: string; errors?: unknown } } })
    ?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.errors)) return (data.errors as string[]).join(', ');
  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors as Record<string, string[]>)
      .flat()
      .join(', ');
  }
  return fallback;
};
