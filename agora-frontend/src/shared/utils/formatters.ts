export const formatCategory = (category: string): string => {
  const lookup: Record<string, string> = {
    Tcc: 'TCC',
    Upx: 'UPX',
    IniciacaoCientifica: 'IC',
    Relatorio: 'Relatório',
    ProjetoEscrito: 'Projeto escrito',
  };
  return lookup[category] ?? category;
};

export const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data desconhecida';
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data desconhecida';
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export const formatDateSimple = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data desconhecida';
  return parsed.toLocaleDateString('pt-BR');
};

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const formatMonth = (value: string): string => {
  const parts = value.split('-').map((item) => Number(item));
  const month = parts[1];
  if (!month || month < 1 || month > 12) return value;
  return monthNames[month - 1];
};

export const getRecentMonths = (count: number): string[] => {
  const today = new Date();
  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(monthNames[date.getMonth()]);
  }
  return labels;
};

export const formatViews = (count: number): string => {
  if (count >= 1000) return `${Math.floor(count / 1000)}k+`;
  return count.toString();
};
