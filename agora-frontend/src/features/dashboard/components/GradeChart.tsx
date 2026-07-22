import { LineChart } from 'lucide-react';

type LineChartData = {
  labels: string[];
  values: number[];
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  points: string;
};

type GradeChartProps = {
  lineChart: LineChartData;
  trend: number | null;
};

const GradeChart = ({ lineChart, trend }: GradeChartProps) => (
  <div
    className="dash-fade bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-6 shadow-[var(--agora-shadow)]"
    style={{ animationDelay: '200ms' }}
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2
          className="font-bold text-[var(--agora-ink)]"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Evolução das notas
        </h2>
        <p className="text-xs text-[var(--agora-muted)]">Últimos 7 meses</p>
      </div>
      {trend === null ? (
        <div className="flex items-center gap-1 text-xs text-[var(--agora-muted)] font-medium">
          <LineChart size={14} />
          Sem comparativo
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <LineChart size={14} />
          {trend >= 0 ? '+' : ''}
          {trend.toFixed(1)}%
        </div>
      )}
    </div>
    <div className="relative">
      {lineChart.values.every((v) => v === 0) ? (
        <div className="h-40 flex items-center justify-center text-sm text-[var(--agora-muted)]">
          Ainda não há dados de evolução de notas.
        </div>
      ) : (
        <svg viewBox={`0 0 ${lineChart.width} ${lineChart.height}`} className="w-full h-40">
          <defs>
            <linearGradient id="greenGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#0a5c2f" />
              <stop offset="100%" stopColor="#18915b" />
            </linearGradient>
          </defs>
          {Array.from({ length: 4 }).map((_, i) => (
            <line
              key={`grid-${i}`}
              x1={lineChart.paddingX}
              x2={lineChart.width - lineChart.paddingX}
              y1={lineChart.paddingY + (i * (lineChart.height - lineChart.paddingY * 2)) / 3}
              y2={lineChart.paddingY + (i * (lineChart.height - lineChart.paddingY * 2)) / 3}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          <polyline
            fill="none"
            stroke="url(#greenGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={lineChart.points}
          />
          {lineChart.values.map((value, index) => {
            const x =
              lineChart.paddingX +
              index *
                ((lineChart.width - lineChart.paddingX * 2) /
                  (lineChart.labels.length - 1 || 1));
            const y =
              lineChart.height -
              lineChart.paddingY -
              (value / Math.max(10, ...lineChart.values)) *
                (lineChart.height - lineChart.paddingY * 2);
            return <circle key={`point-${index}`} cx={x} cy={y} r={4} fill="#0a5c2f" />;
          })}
        </svg>
      )}
      <div className="flex justify-between px-6 mt-1">
        {lineChart.labels.map((label) => (
          <span key={label} className="text-xs text-[var(--agora-muted)]">
            {label}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default GradeChart;
