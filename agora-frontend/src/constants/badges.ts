export const BADGE_LABELS: Record<string, string> = {
  Destaque: '⭐ Destaque',
  Inovacao: '💡 Inovação',
  AplicacaoPratica: '🔧 Aplicação Prática',
  Interdisciplinar: '🔗 Interdisciplinar',
  PotencialMercado: '🚀 Potencial de Mercado',
};

export const BADGE_COLORS: Record<string, string> = {
  Destaque: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Inovacao: 'bg-blue-100 text-blue-800 border-blue-200',
  AplicacaoPratica: 'bg-orange-100 text-orange-800 border-orange-200',
  Interdisciplinar: 'bg-purple-100 text-purple-800 border-purple-200',
  PotencialMercado: 'bg-green-100 text-green-800 border-green-200',
};

export const ALL_BADGES = Object.keys(BADGE_LABELS);
