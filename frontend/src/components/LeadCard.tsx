'use client';

import { Lead } from '@/lib/api';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-600 border-red-200';
}

const CANAL_ICONS: Record<string, string> = { WEB: '🌐', WHATSAPP: '💬', INSTAGRAM: '📸' };
const OPERACION_LABELS: Record<string, string> = { COMPRA: 'Compra', ALQUILER: 'Alquiler', INVERSION: 'Inversión' };

export default function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <div
      onClick={() => onClick(lead)}
      className="bg-white rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group card-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-slate-900 text-sm leading-tight truncate group-hover:text-emerald-700 transition-colors">
          {lead.nombre}
        </p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${scoreColor(lead.score)}`}>
          {lead.score}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-2.5 truncate">
        {OPERACION_LABELS[lead.tipoOperacion] ?? lead.tipoOperacion}
        {lead.zonas.length > 0 && ` · ${lead.zonas[0]}`}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {CANAL_ICONS[lead.canalOrigen] ?? '🌐'} {lead.canalOrigen}
        </span>
        <span className="text-xs text-slate-400">{timeAgo(lead.createdAt)}</span>
      </div>
    </div>
  );
}
