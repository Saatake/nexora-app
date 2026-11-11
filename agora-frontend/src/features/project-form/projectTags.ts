export type ProjectTagOption = { value: string; group: string };

const normalizeLabel = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');

export const searchProjectTags = (
  options: readonly ProjectTagOption[],
  query: string,
): ProjectTagOption[] => {
  const normalizedQuery = normalizeLabel(query);
  if (!normalizedQuery) return [...options];
  return options.filter((option) => normalizeLabel(option.value).includes(normalizedQuery));
};

export const toggleProjectTag = (
  value: string,
  selected: readonly string[],
  options: readonly ProjectTagOption[],
): string[] => {
  if (selected.includes(value)) return selected.filter((tag) => tag !== value);
  if (!options.some((option) => option.value === value)) return [...selected];
  return [...new Set([...selected, value])];
};
