'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLeads, getLeadsPorDia, Lead } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { SkeletonCard } from '@/components/LoadingSkeleton';
import LineChart from '@/components/charts/LineChart';

const ESTADO_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo', CALIFICADO: 'Calificado', VISITA_AGENDADA: 'Visita',
  NEGOCIACION: 'Negociación', CERRADO: 'Cerrado', PERDIDO: 'Perdido',
};
const ESTADO_COLORS: Record<string, string> = {
  NUEVO: 'bg-slate-100 text-slate-700',
  CALIFICADO: 'bg-blue-50 text-blue-700',
  VISITA_AGENDADA: 'bg-purple-50 text-purple-700',
  NEGOCIACION: 'bg-amber-50 text-amber-700',
  CERRADO: 'bg-emerald-50 text-emerald-700',
  PERDIDO: 'bg-red-50 text-red-700',
};
const CANAL_ICONS: Record<string, string> = { WEB: '🌐', WHATSAPP: '💬', INSTAGRAM: '📸' };

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-7 text-right shrink-0">{score}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [leadsRes, diasRes] = await Promise.all([getLeads(), getLeadsPorDia()]);
      setLeads(leadsRes.leads);
      setChartData(diasRes.map(d => ({ label: d.fecha, value: d.total })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const today = new Date().toDateString();
  const leadsHoy = leads.filter(l => new Date(l.createdAt).toDateString() === today).length;
  const leadsCalificados = leads.filter(l => l.score >= 70).length;
  const visitasAgendadas = leads.filter(l => l.estado === 'VISITA_AGENDADA').length;
  const cerrados = leads.filter(l => l.estado === 'CERRADO').length;
  const tasaConversion = leads.length > 0 ? Math.round((cerrados / leads.length) * 100) : 0;
  const recentes = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  const metrics = [
    { label: 'Leads totales', value: leads.length, sub: `${leadsHoy} hoy`, color: 'text-blue-600', bg: 'bg-blue-50', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { label: 'Calificados', value: leadsCalificados, sub: 'Score ≥ 70', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
    { label: 'Visitas agendadas', value: visitasAgendadas, sub: 'En proceso', color: 'text-purple-600', bg: 'bg-purple-50', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { label: 'Conversión', value: `${tasaConversion}%`, sub: `${cerrados} cerrados`, color: 'text-orange-600', bg: 'bg-orange-50', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DashboardHeader title="Dashboard" subtitle="Resumen general de tu CRM" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {/* Metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : metrics.map(m => (
                <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-5 card-shadow hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{m.label}</p>
                    <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>{m.icon}</div>
                  </div>
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
                </div>
              ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Line chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900 text-sm">Leads por día</h2>
              <p className="text-xs text-slate-400 mt-0.5">Últimos 30 días</p>
            </div>
            <LineChart data={chartData} />
          </div>

          {/* Recent leads */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Leads recientes</h2>
            <div className="space-y-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5"><div className="skeleton h-3 w-28 rounded" /><div className="skeleton h-2.5 w-16 rounded" /></div>
                    </div>
                  ))
                : recentes.map(lead => (
                    <div key={lead.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-semibold text-xs shrink-0">
                        {lead.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{lead.nombre}</p>
                        <p className="text-xs text-slate-400">{CANAL_ICONS[lead.canalOrigen]} {lead.tipoOperacion}</p>
                      </div>
                      <div className="text-right space-y-1 shrink-0 w-28">
                        <ScoreBar score={lead.score} />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ESTADO_COLORS[lead.estado]}`}>
                          {ESTADO_LABELS[lead.estado]}
                        </span>
                      </div>
                    </div>
                  ))}
              {!loading && recentes.length === 0 && <p className="text-center text-sm text-slate-400 py-6">Sin leads aún</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
