type EvalBarProps = { label: string; value: number };

const EvalBar = ({ label, value }: EvalBarProps) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-[var(--agora-muted)]">{label}</span>
      <span className="font-semibold text-[var(--agora-ink)]">{value.toFixed(1)}</span>
    </div>
    <div className="h-1.5 bg-[var(--agora-border)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-[var(--agora-accent)]"
        style={{ width: `${(value / 10) * 100}%` }}
      />
    </div>
  </div>
);

export default EvalBar;
