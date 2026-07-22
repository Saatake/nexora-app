type CriteriaBar = { label: string; value: number; color: string };

type CriteriaChartProps = {
  criteriaBars: CriteriaBar[];
};

const CriteriaChart = ({ criteriaBars }: CriteriaChartProps) => (
  <div
    className="dash-fade bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-6 shadow-[var(--agora-shadow)]"
    style={{ animationDelay: '300ms' }}
  >
    <h2
      className="font-bold text-[var(--agora-ink)] mb-4"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      Média por critério
    </h2>
    <div className="space-y-3">
      {criteriaBars.every((bar) => bar.value === 0) ? (
        <div className="text-sm text-[var(--agora-muted)]">
          Ainda não há avaliações por critério.
        </div>
      ) : (
        criteriaBars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--agora-muted)]">{bar.label}</span>
              <span className="font-semibold text-[var(--agora-ink)]">{bar.value.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(bar.value / 10) * 100}%`, backgroundColor: bar.color }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default CriteriaChart;
