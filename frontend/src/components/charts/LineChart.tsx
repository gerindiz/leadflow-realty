'use client';

interface DataPoint { label: string; value: number }
interface Props { data: DataPoint[]; color?: string; height?: number }

export default function LineChart({ data, color = '#10b981', height = 160 }: Props) {
  if (!data.length) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Sin datos</div>;

  const max = Math.max(...data.map(d => d.value), 1);
  const w = 600; const h = height;
  const pad = { top: 12, right: 12, bottom: 30, left: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * innerW,
    y: pad.top + innerH - (d.value / max) * innerH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`;
  const ticks = 4;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const y = pad.top + (i / ticks) * innerH;
        const val = Math.round(max * (1 - i / ticks));
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{val}</text>
          </g>
        );
      })}

      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="2" />
      ))}

      {points.map((p, i) => {
        const step = Math.max(1, Math.floor(data.length / 7));
        if (i % step !== 0 && i !== data.length - 1) return null;
        return <text key={i} x={p.x} y={h - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{p.label.slice(5)}</text>;
      })}
    </svg>
  );
}
