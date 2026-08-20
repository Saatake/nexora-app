import { ClipboardList, Star, BookOpen } from 'lucide-react';

type Props = {
  evaluationsGiven: number;
  areasCount: number;
  pendingCount: number;
};

const ProfessorStatsCards = ({ evaluationsGiven, areasCount, pendingCount }: Props) => {
  const cards = [
    {
      label: 'Avaliações Realizadas',
      value: evaluationsGiven,
      icon: Star,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: 'Áreas de Ensino',
      value: areasCount,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Aguardando Avaliação',
      value: pendingCount,
      icon: ClipboardList,
      color: 'text-[#0a5c2f] bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfessorStatsCards;
