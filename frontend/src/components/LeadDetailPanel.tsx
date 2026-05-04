'use client';

import { useState, useEffect } from 'react';
import { Lead, updateLeadEstado, addNota, getTimeline, TimelineItem } from '@/lib/api';

interface Props {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updated: Lead) => void;
}

type Tab = 'info' | 'conversacion' | 'notas' | 'timeline';

const ESTADOS: Lead['estado'][] = ['NUEVO', 'CALIFICADO', 'VISITA_AGENDADA', 'NEGOCIACION', 'CERRADO', 'PERDIDO'];
const ESTADO_LABELS: Record<Lead['estado'], string> = {
  NUEVO: 'Nuevo', CALIFICADO: 'Calificado', VISITA_AGENDADA: 'Visita', NEGOCIACION: 'Neg.', CERRADO: 'Cerrado', PERDIDO: 'Perdido',
};
const ESTADO_ACTIVE: Record<Lead['estado'], string> = {
  NUEVO: 'bg-slate-700 text-white',
  CALIFICADO: 'bg-blue-600 text-white',
  VISITA_AGENDADA: 'bg-purple-600 text-white',
  NEGOCIACION: 'bg-amber-500 text-white',
  CERRADO: 'bg-emerald-600 text-white',
  PERDIDO: 'bg-red-600 text-white',
};

function scoreBadge(score: number) {
  if (score >= 70) return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', bar: 'bg-emerald-500' };
  if (score >= 40) return { bg: 'bg-amber-50 border-amber-200 text-amber-700', bar: 'bg-amber-400' };
  return { bg: 'bg-red-50 border-red-200 text-red-700', bar: 'bg-red-500' };
}

const TIMELINE_DOTS: Record<string, string> = {
  CREACION: 'bg-emerald-500',
  CONVERSACION: 'bg-blue-500',
  NOTA: 'bg-purple-500',
};

export default function LeadDetailPanel({ lead, onClose, onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('info');
  const [current, setCurrent] = useState(lead);
  const [updating, setUpdating] = useState(false);
  const [agente, setAgente] = useState(lead.agenteAsignado ?? '');
  const [nota, setNota] = useState('');
  const [savingNota, setSavingNota] = useState(false);
  const [notas, setNotas] = useState(lead.notas ?? []);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    setCurrent(lead);
    setAgente(lead.agenteAsignado ?? '');
    setNotas(lead.notas ?? []);
  }, [lead]);

  useEffect(() => {
    if (tab === 'timeline' && timeline.length === 0) {
      setTimelineLoading(true);
      getTimeline(lead.id).then(setTimeline).catch(console.error).finally(() => setTimelineLoading(false));
    }
  }, [tab, lead.id, timeline.length]);

  const handleEstado = async (estado: Lead['estado']) => {
    setUpdating(true);
    try {
      const updated = await updateLeadEstado(lead.id, estado, agente || undefined);
      setCurrent(updated);
      onUpdate(updated);
    } catch (e) { console.error(e); }
    setUpdating(false);
  };

  const handleNota = async () => {
    if (!nota.trim()) return;
    setSavingNota(true);
    try {
      const n = await addNota(lead.id, nota.trim(), agente || undefined);
      setNotas(prev => [...prev, n]);
      setNota('');
    } catch (e) { console.error(e); }
    setSavingNota(false);
  };

  const conversacion = current.conversaciones?.[0];
  const mensajes = conversacion?.mensajes as Array<{ role: string; content: string }> | undefined;
  const { bg: scoreBg, bar: scoreBar } = scoreBadge(current.score);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Info' },
    { id: 'conversacion', label: 'Chat' },
    { id: 'notas', label: `Notas${notas.length ? ` (${notas.length})` : ''}` },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl overflow-hidden flex flex-col border-l border-slate-200"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideInRight 0.22s ease forwards' }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
              {current.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">{current.nombre}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{current.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Score */}
        <div className={`mx-5 mt-4 px-4 py-3.5 rounded-xl border ${scoreBg} shrink-0`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-medium opacity-60 mb-0.5">Lead Score</p>
              <p className="text-2xl font-bold">
                {current.score}
                <span className="text-sm font-normal opacity-40 ml-1">/100</span>
              </p>
            </div>
            <div className="text-right text-xs opacity-60 space-y-0.5">
              <p className="font-medium">{current.canalOrigen}</p>
              <p>{new Date(current.createdAt).toLocaleDateString('es-AR')}</p>
            </div>
          </div>
          <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div className={`h-full ${scoreBar} rounded-full transition-all`} style={{ width: `${current.score}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-5 mt-4 bg-slate-100 rounded-xl p-1 shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* ── INFO ── */}
          {tab === 'info' && (
            <>
              <section>
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Contacto</h3>
                <div className="space-y-2">
                  <a href={`tel:${current.telefono}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-emerald-700 transition-colors group">
                    <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-base group-hover:bg-emerald-50 transition-colors shrink-0">📞</span>
                    {current.telefono}
                  </a>
                  <a href={`mailto:${current.email}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-emerald-700 transition-colors group">
                    <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-base group-hover:bg-emerald-50 transition-colors shrink-0">✉️</span>
                    {current.email}
                  </a>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Búsqueda</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Operación', value: current.tipoOperacion },
                    { label: 'Urgencia', value: current.urgencia.replace(/_/g, ' ') },
                    { label: 'Zonas', value: current.zonas.join(', ') || '—' },
                    { label: 'Ambientes', value: current.ambientes ? `${current.ambientes} amb.` : '—' },
                    { label: 'Presupuesto', value: current.presupuestoMax ? `Hasta $${current.presupuestoMax.toLocaleString('es-AR')}` : '—' },
                    { label: 'Financiamiento', value: current.tieneFinanciamiento ? 'Necesita' : 'Al contado' },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Agente asignado</h3>
                <input
                  value={agente}
                  onChange={e => setAgente(e.target.value)}
                  placeholder="Nombre del agente..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />
              </section>

              <section>
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Estado en pipeline</h3>
                <div className="grid grid-cols-3 gap-2">
                  {ESTADOS.map(e => (
                    <button
                      key={e}
                      disabled={updating}
                      onClick={() => handleEstado(e)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ${
                        current.estado === e
                          ? ESTADO_ACTIVE[e]
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ESTADO_LABELS[e]}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── CHAT ── */}
          {tab === 'conversacion' && (
            <div>
              {mensajes && mensajes.length > 0 ? (
                <div className="space-y-3">
                  {mensajes.filter(m => m.role !== 'system').map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-sm">Sin conversación registrada</p>
                </div>
              )}
            </div>
          )}

          {/* ── NOTAS ── */}
          {tab === 'notas' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  placeholder="Escribí una nota sobre este lead..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none transition-all"
                />
                <button
                  onClick={handleNota}
                  disabled={savingNota || !nota.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {savingNota && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Guardar nota
                </button>
              </div>

              {notas.length > 0 ? (
                <div className="space-y-3">
                  {[...notas].reverse().map((n, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 card-shadow">
                      <p className="text-sm text-slate-700 leading-relaxed">{n.contenido}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        {n.autor && <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{n.autor}</span>}
                        <span className="text-[11px] text-slate-400">
                          {new Date(n.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-sm">Sin notas todavía</p>
                </div>
              )}
            </div>
          )}

          {/* ── TIMELINE ── */}
          {tab === 'timeline' && (
            <div>
              {timelineLoading ? (
                <div className="flex justify-center py-12">
                  <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : timeline.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200" />
                  <div className="space-y-5">
                    {timeline.map((item, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className={`w-7 h-7 rounded-full ${TIMELINE_DOTS[item.tipo] ?? 'bg-slate-400'} flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm`}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <p className="text-sm text-slate-800 leading-snug font-medium">{item.descripcion}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(item.fecha).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">Sin historial disponible</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
