'use client';

interface Slice { label: string; value: number; color: string }
interface Props { data: Slice[]; size?: number }

export default function PieChart({ data, size = 160 }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Sin datos</div>;

  const cx = size / 2; const cy = size / 2;
  const r = size * 0.38; const innerR = size * 0.22;

  let startAngle = -Math.PI / 2;
  const slices = data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const midAngle = startAngle + angle / 2;
    const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle); const y2 = cy + r * Math.sin(startAngle + angle);
    const ix1 = cx + innerR * Math.cos(startAngle); const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(startAngle + angle); const iy2 = cy + innerR * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
    const result = { ...d, path, midAngle, pct: Math.round((d.value / total) * 100) };
    startAngle += angle;
    return result;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1e293b">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8">leads</text>
      </svg>
      <div className="space-y-2.5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-slate-600 truncate flex-1">{s.label}</span>
            <span className="font-semibold text-slate-900 shrink-0">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
