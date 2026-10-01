import type { Symptom } from '@/lib/labels';
import { formatDate } from '@/lib/labels';

const series = [
  { key: 'painLevel', label: 'Dolor', color: '#2B7DB8' },
  { key: 'fatigueLevel', label: 'Cansancio', color: '#7BB89A' },
  { key: 'nauseaLevel', label: 'Náuseas', color: '#F2856B' },
] as const;

/** Gráfico de líneas simple (SVG) de la evolución de síntomas, 0–10. */
export function SymptomTrend({ symptoms }: { symptoms: Symptom[] }) {
  const points = [...symptoms].sort((a, b) => a.loggedDate.localeCompare(b.loggedDate));
  if (points.length < 2) {
    return <p className="py-8 text-center text-sm text-ink/60">Se necesitan al menos 2 registros para ver la evolución.</p>;
  }

  const W = 640;
  const H = 220;
  const pad = { l: 28, r: 12, t: 12, b: 28 };
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (points.length - 1);
  const y = (v: number) => pad.t + ((10 - v) * (H - pad.t - pad.b)) / 10;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Evolución de síntomas">
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#D5E6F5" strokeDasharray={v === 0 ? '' : '4 4'} />
            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#2A3B4D" opacity="0.5">
              {v}
            </text>
          </g>
        ))}
        {[0, points.length - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : 'end'} fontSize="11" fill="#2A3B4D" opacity="0.5">
            {formatDate(points[i].loggedDate)}
          </text>
        ))}
        {series.map((s) => (
          <polyline
            key={s.key}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points.map((p, i) => `${x(i)},${y(p[s.key])}`).join(' ')}
          />
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink/70">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
