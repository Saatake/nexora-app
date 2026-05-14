const flattenErrorMessages = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(flattenErrorMessages);
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(flattenErrorMessages);
  }
  return [];
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  const responseData = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof responseData === 'string') return responseData;
  if (!responseData || typeof responseData !== 'object') return fallback;

  const data = responseData as { message?: unknown; errors?: unknown };
  if (typeof data.message === 'string') return data.message;

  const errors = flattenErrorMessages(data.errors);
  return errors.length > 0 ? errors.join(', ') : fallback;
};
