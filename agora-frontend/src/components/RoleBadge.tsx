type RoleBadgeProps = {
  role?: string;
  size?: 'xs' | 'sm';
  className?: string;
};

const RoleBadge = ({ role, size = 'xs', className = '' }: RoleBadgeProps) => {
  if (!role) return null;

  const isProfessor = role === 'Professor';
  const label = isProfessor ? 'Professor' : 'Aluno';
  const sizeCls = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5';

  const style = isProfessor
    ? 'bg-[var(--agora-accent-bg)] text-[var(--agora-accent)] border border-[var(--agora-accent)]/30'
    : 'bg-slate-100 text-slate-600 border border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeCls} ${style} ${className}`}>
      {label}
    </span>
  );
};

export default RoleBadge;
