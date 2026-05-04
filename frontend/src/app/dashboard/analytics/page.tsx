'use client';

import { useState, useEffect } from 'react';
import { getLeadsPorDia, getConversionPorCanal, getPerformanceAgentes, ConversionCanal, PerformanceAgente } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import { SkeletonChart } from '@/components/LoadingSkeleton';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [dias, setDias] = useState<{ label: string; value: number }[]>([]);
  const [canales, setCanales] = useState<ConversionCanal[]>([]);
  const [agentes, setAgentes] = useState<PerformanceAgente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeadsPorDia(), getConversionPorCanal(), getPerformanceAgentes()])
      .then(([d, c, a]) => {
        setDias(d.map(x => ({ label: x.fecha, value: x.total })));
        setCanales(c);
        setAgentes(a);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalLeads = canales.reduce((s, c) => s + c.total, 0);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DashboardHeader title="Analytics" subtitle="Métricas y rendimiento del sistema" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total leads (30d)', value: totalLeads, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Mejor conversión', value: canales.length ? canales.reduce((a, b) => a.tasa > b.tasa ? a : b).canal : '—', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Top agente', value: agentes.length ? agentes.reduce((a, b) => a.total > b.total ? a : b).agente : '—', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{m.label}</p>
              <p className={`text-xl font-bold mt-2 ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Line */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <h2 className="font-semibold text-slate-900 text-sm mb-1">Leads por día</h2>
            <p className="text-xs text-slate-400 mb-4">Últimos 30 días</p>
            {loading ? <SkeletonChart /> : <LineChart data={dias} height={180} />}
          </div>

          {/* Pie */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <h2 className="font-semibold text-slate-900 text-sm mb-1">Leads por canal</h2>
            <p className="text-xs text-slate-400 mb-4">Distribución total</p>
            {loading ? <SkeletonChart /> : <PieChart data={canales.map((c, i) => ({ label: c.canal, value: c.total, color: PIE_COLORS[i % PIE_COLORS.length] }))} size={160} />}
          </div>
        </div>

        {/* Conversion table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
          <h2 className="font-semibold text-slate-900 text-sm mb-4">Conversión por canal</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Canal', 'Total leads', 'Calificados', 'Tasa de conversión'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j} className="py-3"><div className="skeleton h-3 w-16 rounded" /></td>)}</tr>)
                : canales.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-900"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{c.canal}</div></td>
                      <td className="py-3 text-slate-600">{c.total}</td>
                      <td className="py-3 text-slate-600">{c.calificados}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-24">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round(c.tasa * 100)}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{Math.round(c.tasa * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Agentes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
          <h2 className="font-semibold text-slate-900 text-sm mb-4">Performance por agente</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Agente', 'Asignados', 'Calificados', 'Cerrados'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j} className="py-3"><div className="skeleton h-3 w-20 rounded" /></td>)}</tr>)
                : agentes.length === 0
                  ? <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-xs">Sin agentes asignados</td></tr>
                  : agentes.map((a, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">{a.agente.charAt(0).toUpperCase()}</div><span className="font-medium text-slate-900">{a.agente}</span></div></td>
                        <td className="py-3 text-slate-600">{a.total}</td>
                        <td className="py-3 text-slate-600">{a.calificados}</td>
                        <td className="py-3"><span className="text-emerald-700 font-semibold">{a.cerrados}</span></td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
