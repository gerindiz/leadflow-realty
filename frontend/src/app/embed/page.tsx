'use client';

import { useState } from 'react';
import Link from 'next/link';

const SNIPPET = `<!-- LeadFlow Realty Widget -->
<script>
  window.LeadFlowConfig = {
    apiUrl: 'https://tu-dominio.com',
    primaryColor: '#10b981',
    botName: 'Sofía',
  };
</script>
<script src="https://tu-dominio.com/widget.js" async></script>`;

export default function EmbedPage() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-sm shadow-sm">🏠</div>
            <span className="font-bold text-slate-900 text-sm">LeadFlow Realty</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
            → Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-emerald-700 text-sm font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Instalación del Widget
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Instalá el widget en tu sitio</h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            Agrega el chatbot de Sofía a cualquier sitio web en menos de 2 minutos.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {[
            { num: '1', title: 'Copiá el código', desc: 'Hacé clic en "Copiar código" para obtener el snippet de instalación.' },
            { num: '2', title: 'Pegalo en tu HTML', desc: 'Insertá el código antes del cierre del tag </body> en todas las páginas donde quieras el chat.' },
            { num: '3', title: 'Configurá tu API URL', desc: 'Reemplazá https://tu-dominio.com con la URL donde está corriendo tu backend de LeadFlow.' },
          ].map(step => (
            <div key={step.num} className="flex gap-4 bg-white border border-slate-200 rounded-xl p-5 card-shadow">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shrink-0 mt-0.5 shadow-sm">
                {step.num}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Code block */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-slate-400 font-mono">index.html</span>
            <button
              onClick={copy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copied ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {copied ? (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copiado!</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copiar código</>
              )}
            </button>
          </div>
          <pre className="px-5 py-5 text-sm text-slate-300 overflow-x-auto font-mono leading-relaxed">
            <code>{SNIPPET}</code>
          </pre>
        </div>

        {/* Compatibility */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow">
          <h2 className="font-semibold text-slate-900 mb-4">Compatible con cualquier plataforma</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['WordPress', 'Wix', 'Webflow', 'HTML puro', 'React', 'Vue', 'Next.js', 'Shopify'].map(p => (
              <div key={p} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-700 font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-4">
          <p className="text-slate-500">¿Todo listo? Verificá tu configuración en el dashboard.</p>
          <Link
            href="/dashboard/configuracion"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm shadow-emerald-600/20"
          >
            Ir a configuración
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
