'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLeads, Lead } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import LeadCard from '@/components/LeadCard';
import LeadDetailPanel from '@/components/LeadDetailPanel';

type EstadoLead = Lead['estado'];

const COLUMNAS: { id: EstadoLead; label: string; dot: string; bg: string }[] = [
  { id: 'NUEVO', label: 'Nuevo', dot: 'bg-slate-400', bg: 'bg-slate-50 border-slate-200' },
  { id: 'CALIFICADO', label: 'Calificado', dot: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200' },
  { id: 'VISITA_AGENDADA', label: 'Visita Agendada', dot: 'bg-purple-500', bg: 'bg-purple-50 border-purple-200' },
  { id: 'NEGOCIACION', label: 'Negociación', dot: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200' },
  { id: 'CERRADO', label: 'Cerrado', dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
  { id: 'PERDIDO', label: 'Perdido', dot: 'bg-red-400', bg: 'bg-red-50 border-red-200' },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [canalFilter, setCanalFilter] = useState('Todos');

  const load = useCallback(async () => {
    try {
      const f: Record<string, string> = {};
      if (canalFilter !== 'Todos') f.canal = canalFilter;
      const res = await getLeads(f);
      setLeads(res.leads);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [canalFilter]);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const handleUpdate = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(updated);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DashboardHeader title="Pipeline" subtitle="Kanban de gestión de leads" />
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Filters bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">Canal:</span>
          {['Todos', 'WEB', 'WHATSAPP', 'INSTAGRAM'].map(c => (
            <button key={c} onClick={() => setCanalFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${canalFilter === c ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{c}</button>
          ))}
          <span className="ml-auto text-xs text-slate-400">{leads.length} leads</span>
          <button onClick={load} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Cargando pipeline...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50">
            <div className="flex gap-4 p-6 h-full min-w-max">
              {COLUMNAS.map(col => {
                const colLeads = leads.filter(l => l.estado === col.id);
                return (
                  <div key={col.id} className={`w-64 shrink-0 rounded-xl border ${col.bg} flex flex-col`} style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    <div className="flex items-center justify-between px-3 py-3 border-b border-inherit">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                        <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center shadow-sm">
                        {colLeads.length}
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {colLeads.length === 0
                        ? <div className="text-center py-8 text-slate-400 text-xs">Sin leads</div>
                        : colLeads.map(lead => <LeadCard key={lead.id} lead={lead} onClick={setSelectedLead} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {selectedLead && <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
