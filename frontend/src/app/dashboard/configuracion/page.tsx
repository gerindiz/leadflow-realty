'use client';

import { useState, useEffect } from 'react';
import { getConfig, saveConfig, Config } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

export default function ConfiguracionPage() {
  const [form, setForm] = useState<Partial<Config>>({ nombreAgencia: '', nombreBot: 'Sofía', scoreUmbral: 70, horarioInicio: '08:00', horarioFin: '20:00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getConfig().then(c => setForm(c)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      const updated = await saveConfig(form);
      setForm(updated); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const set = (key: keyof Config, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );

  const inputClass = "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all";

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DashboardHeader title="Configuración" subtitle="Parámetros del sistema y del bot" />
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <form onSubmit={handleSave} className="max-w-xl space-y-5">

          {/* Agencia */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900 text-sm">Datos de la agencia</h2>
            </div>
            <Field label="Nombre de la agencia">
              {loading
                ? <div className="skeleton h-10 w-full rounded-xl" />
                : <input type="text" value={form.nombreAgencia ?? ''} onChange={e => set('nombreAgencia', e.target.value)} placeholder="Ej: Inmobiliaria García" className={inputClass} />}
            </Field>
          </div>

          {/* Bot */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900 text-sm">Configuración del bot</h2>
            </div>
            <Field label="Nombre del asistente">
              {loading
                ? <div className="skeleton h-10 w-full rounded-xl" />
                : <input type="text" value={form.nombreBot ?? ''} onChange={e => set('nombreBot', e.target.value)} className={inputClass} />}
            </Field>
            <Field
              label={`Score mínimo para notificación — ${form.scoreUmbral} pts`}
              hint="Se envía email automático cuando el score del lead supera este umbral."
            >
              {loading
                ? <div className="skeleton h-8 w-full rounded-xl" />
                : (
                  <div className="space-y-2">
                    <input type="range" min={0} max={100} step={5} value={form.scoreUmbral ?? 70} onChange={e => set('scoreUmbral', Number(e.target.value))} className="w-full accent-emerald-600" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0</span>
                      <span className="text-emerald-600 font-semibold">{form.scoreUmbral} pts</span>
                      <span>100</span>
                    </div>
                  </div>
                )}
            </Field>
          </div>

          {/* Horario */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900 text-sm">Horario de atención</h2>
            </div>
            <p className="text-xs text-slate-500">Fuera de este horario el bot informa que no hay agentes disponibles.</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hora de inicio">
                {loading
                  ? <div className="skeleton h-10 w-full rounded-xl" />
                  : <input type="time" value={form.horarioInicio ?? '08:00'} onChange={e => set('horarioInicio', e.target.value)} className={inputClass} />}
              </Field>
              <Field label="Hora de fin">
                {loading
                  ? <div className="skeleton h-10 w-full rounded-xl" />
                  : <input type="time" value={form.horarioFin ?? '20:00'} onChange={e => set('horarioFin', e.target.value)} className={inputClass} />}
              </Field>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 shadow-sm"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Cambios guardados
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
