'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLeads, exportLeadsCSV, Lead } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import LeadDetailPanel from '@/components/LeadDetailPanel';
import { SkeletonRow } from '@/components/LoadingSkeleton';

const CANAL_ICONS: Record<string, string> = { WEB: '🌐', WHATSAPP: '💬', INSTAGRAM: '📸' };
const ESTADOS: Lead['estado'][] = ['NUEVO', 'CALIFICADO', 'VISITA_AGENDADA', 'NEGOCIACION', 'CERRADO', 'PERDIDO'];
const ESTADO_LABELS: Record<string, string> = { NUEVO: 'Nuevo', CALIFICADO: 'Calificado', VISITA_AGENDADA: 'Visita', NEGOCIACION: 'Neg.', CERRADO: 'Cerrado', PERDIDO: 'Perdido' };
const ESTADO_COLORS: Record<string, string> = {
  NUEVO: 'bg-slate-100 text-slate-700',
  CALIFICADO: 'bg-blue-50 text-blue-700',
  VISITA_AGENDADA: 'bg-purple-50 text-purple-700',
  NEGOCIACION: 'bg-amber-50 text-amber-700',
  CERRADO: 'bg-emerald-50 text-emerald-700',
  PERDIDO: 'bg-red-50 text-red-700',
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2 w-28">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-6 text-right shrink-0">{score}</span>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [canalFilter, setCanalFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'createdAt' | 'score'>('createdAt');

  const load = useCallback(async () => {
    try {
      const f: Record<string, string> = {};
      if (canalFilter !== 'Todos') f.canal = canalFilter;
      if (estadoFilter !== 'Todos') f.estado = estadoFilter;
      const res = await getLeads(f);
      setLeads(res.leads);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [canalFilter, estadoFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = leads
    .filter(l => !search || l.nombre.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortKey === 'score' ? b.score - a.score : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleUpdate = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(updated);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DashboardHeader title="Leads" subtitle={`${leads.length} leads registrados`} />
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3 card-shadow">
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['Todos', ...ESTADOS].map(e => (
              <button key={e} onClick={() => setEstadoFilter(e)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${estadoFilter === e ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {e === 'Todos' ? 'Todos' : ESTADO_LABELS[e]}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {['Todos', 'WEB', 'WHATSAPP', 'INSTAGRAM'].map(c => (
              <button key={c} onClick={() => setCanalFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${canalFilter === c ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)} className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="createdAt">Más recientes</option>
              <option value="score">Mayor score</option>
            </select>
            <button onClick={exportLeadsCSV} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
            <button onClick={load} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors border border-slate-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Lead', 'Contacto', 'Tipo', 'Score', 'Estado', 'Canal', 'Fecha', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={8}><SkeletonRow /></td></tr>)
                  : filtered.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-semibold text-xs shrink-0">
                              {lead.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{lead.nombre}</p>
                              {lead.agenteAsignado && <p className="text-xs text-slate-400">→ {lead.agenteAsignado}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><p className="text-xs text-slate-600">{lead.email}</p><p className="text-xs text-slate-400">{lead.telefono}</p></td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-700 font-medium">{lead.tipoOperacion}</span></td>
                        <td className="px-4 py-3"><ScoreBar score={lead.score} /></td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_COLORS[lead.estado]}`}>{ESTADO_LABELS[lead.estado]}</span></td>
                        <td className="px-4 py-3"><span className="text-sm">{CANAL_ICONS[lead.canalOrigen]}</span></td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span></td>
                        <td className="px-4 py-3"><button className="text-xs text-emerald-600 hover:underline font-medium">Ver</button></td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400"><p className="text-sm">No se encontraron leads</p></div>
            )}
          </div>
        </div>
      </div>
      {selectedLead && <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
