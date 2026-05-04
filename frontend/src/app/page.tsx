'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

/* ── Typing headline ── */
const PHRASES = [
  'Tu próximo cliente ya está online.',
  'Calificá leads sin levantar el teléfono.',
  'Vendé más propiedades, trabajá menos.',
];

function TypingHeadline() {
  const [text, setText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const full = PHRASES[phraseIdx];
    const delay = deleting ? 25 : 65;
    const t = setTimeout(() => {
      if (!deleting) {
        if (text.length < full.length) setText(full.slice(0, text.length + 1));
        else setTimeout(() => setDeleting(true), 2200);
      } else {
        if (text.length > 0) setText(text.slice(0, -1));
        else { setDeleting(false); setPhraseIdx((phraseIdx + 1) % PHRASES.length); }
      }
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, phraseIdx]);
  return <span>{text}<span className="cursor-blink text-emerald-500">|</span></span>;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('visible'); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let cur = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          setVal(cur);
          if (cur >= target) clearInterval(t);
        }, 20);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  { icon: '🤖', title: 'IA conversacional', desc: 'Sofía atiende consultas 24/7, califica al lead y captura sus datos automáticamente sin intervención humana.' },
  { icon: '📊', title: 'Lead scoring', desc: 'Algoritmo que puntúa cada lead del 0 al 100 según urgencia, presupuesto y tipo de operación.' },
  { icon: '📱', title: 'Widget embebible', desc: 'Un script de 2 líneas en tu sitio web y el chat está activo. Sin programadores ni configuraciones complejas.' },
  { icon: '📧', title: 'Notificaciones al instante', desc: 'El agente recibe un email con perfil completo del lead en el momento que supera el umbral de calificación.' },
  { icon: '🏗️', title: 'Pipeline visual CRM', desc: 'Kanban con 6 etapas: Nuevo → Calificado → Visita → Negociación → Cerrado. Todo en un vistazo.' },
  { icon: '📈', title: 'Analytics integrado', desc: 'Métricas en tiempo real: leads por día, tasa de conversión por canal y performance por agente.' },
];

const STEPS = [
  { n: '01', title: 'Instalá el widget', desc: 'Copiá una línea de código en tu web. Sin configuración técnica. Compatible con cualquier plataforma.' },
  { n: '02', title: 'Sofía califica el lead', desc: 'El chatbot IA conduce la conversación y captura todos los datos del potencial comprador automáticamente.' },
  { n: '03', title: 'Recibís el lead calificado', desc: 'Notificación instantánea con perfil completo, score y datos de contacto. Listo para cerrar.' },
];

const TESTIMONIALS = [
  { name: 'Martina Soria', role: 'Directora — Soria Propiedades', avatar: 'MS', text: 'Pasamos de 3 a 25 leads calificados por semana sin contratar más personal. LeadFlow es indispensable para nuestra operación.' },
  { name: 'Carlos Pinheiro', role: 'Broker — RE/MAX Norte', avatar: 'CP', text: 'El score de leads nos ahorra horas de llamadas en frío. Ahora solo contactamos a quien realmente tiene intención de comprar.' },
  { name: 'Laura Benítez', role: 'Gerenta — Benítez & Asociados', avatar: 'LB', text: 'En el primer mes recuperamos la inversión. El chatbot atiende consultas a las 2am y las encontramos calificadas a la mañana.' },
];

const PLANS = [
  {
    name: 'Starter', price: 199, popular: false,
    features: ['1 agente', '100 leads/mes', 'Chat widget', 'Email notificaciones', 'Pipeline básico'],
  },
  {
    name: 'Growth', price: 499, popular: true,
    features: ['5 agentes', '500 leads/mes', 'Chat widget + WhatsApp', 'CRM completo', 'Analytics avanzado', 'Soporte prioritario'],
  },
  {
    name: 'Enterprise', price: 1499, popular: false,
    features: ['Agentes ilimitados', 'Leads ilimitados', 'Multi-sucursal', 'API acceso completo', 'Integración CRM propio', 'SLA 99.9%'],
  },
];

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <main className="bg-white text-slate-900 min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-sm shadow-sm">🏠</div>
            <span className="font-bold text-slate-900 tracking-tight">LeadFlow Realty</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Funciones</a>
            <a href="#how" className="hover:text-slate-900 transition-colors">Cómo funciona</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors hidden sm:block font-medium">
              Dashboard
            </Link>
            <a
              href="#pricing"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Empezar gratis
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-28 px-6 text-center relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)',
            backgroundSize: '28px 28px',
            opacity: 0.6,
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-50 rounded-full blur-3xl opacity-70 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Powered by Claude AI · Disponible 24/7
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-slate-900 tracking-tight min-h-[1.2em]">
            <span className="gradient-text"><TypingHeadline /></span>
          </h1>

          <p className="text-slate-500 text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Sofía, tu asesora virtual IA, captura y califica leads inmobiliarios automáticamente mientras tu equipo duerme.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-md shadow-emerald-500/20"
            >
              Comenzar — 14 días gratis
            </a>
            <Link
              href="/dashboard"
              className="border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium px-8 py-4 rounded-xl transition-all shadow-sm"
            >
              Ver demo en vivo →
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <div className="flex -space-x-2">
              {['MS', 'CP', 'LB', 'AR', 'JG'].map((a, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold"
                >
                  {a}
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm">
              <span className="font-semibold text-slate-800">+200</span> inmobiliarias confían en LeadFlow
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-slate-50 py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            { num: 500, suf: '+', label: 'Leads calificados por mes' },
            { num: 70, suf: '%', label: 'Reducción en tiempo por lead' },
            { num: 24, suf: '/7', label: 'Disponibilidad del chatbot' },
          ].map(s => (
            <Reveal key={s.label}>
              <div className="text-5xl font-bold gradient-text mb-2">
                <CountUp target={s.num} suffix={s.suf} />
              </div>
              <p className="text-slate-500 text-sm font-medium">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">Funcionalidades</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4">Todo lo que necesitás para vender más</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Una plataforma completa: desde la captación hasta el cierre del negocio.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-md transition-all group card-shadow">
                  <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-emerald-50 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">Proceso</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4">Cómo funciona</h2>
              <p className="text-slate-500 text-lg">De cero a leads calificados en menos de 10 minutos.</p>
            </div>
          </Reveal>
          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="flex gap-6 items-start bg-white border border-slate-200 rounded-2xl p-7 hover:border-emerald-300 hover:shadow-md transition-all card-shadow group">
                  <span className="text-5xl font-black gradient-text shrink-0 leading-none">{s.n}</span>
                  <div className="pt-1">
                    <h3 className="font-bold text-slate-900 text-xl mb-2 group-hover:text-emerald-700 transition-colors">{s.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">Testimonios</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4">Lo que dicen las inmobiliarias</h2>
              <p className="text-slate-500 text-lg">Resultados reales de clientes que ya usan LeadFlow.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 card-shadow hover:shadow-md hover:border-slate-300 transition-all h-full">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-slate-900 text-sm font-semibold">{t.name}</p>
                      <p className="text-slate-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">Precios</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4">Planes simples y transparentes</h2>
              <p className="text-slate-500 text-lg">Sin contratos. Sin sorpresas. Cancelá cuando quieras.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <div className={`relative rounded-2xl p-8 flex flex-col h-full transition-all ${
                  p.popular
                    ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
                    : 'bg-white border border-slate-200 card-shadow hover:shadow-md hover:border-slate-300'
                }`}>
                  {p.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                      Más popular
                    </div>
                  )}
                  <div className="mb-7">
                    <h3 className="font-bold text-slate-900 text-xl mb-3">{p.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">${p.price}</span>
                      <span className="text-slate-400 text-sm">/mes</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <span className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    p.popular
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}>
                    Empezar con {p.name}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />
        <Reveal>
          <div className="max-w-2xl mx-auto text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Empezá a captar leads<br />desde hoy
            </h2>
            <p className="text-emerald-100 text-lg mb-10">14 días gratis. Sin tarjeta de crédito. Instalación en 5 minutos.</p>
            <a
              href="#pricing"
              className="inline-block bg-white hover:bg-slate-50 text-emerald-700 font-bold px-10 py-5 rounded-xl transition-all hover:scale-105 text-lg shadow-xl"
            >
              Crear mi cuenta gratis
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-sm">🏠</div>
                <span className="font-bold text-white">LeadFlow Realty</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                La plataforma de captación de leads inmobiliarios con inteligencia artificial más completa del mercado.
              </p>
              <div className="flex gap-2.5 mt-5">
                {['T', 'in', 'ig'].map((s, i) => (
                  <a key={i} href="#" className="w-9 h-9 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all text-xs font-medium">
                    {s}
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Producto', links: ['Funciones', 'Precios', 'Changelog', 'Roadmap'] },
              { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Contacto', 'Privacidad'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-white mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2026 LeadFlow Realty. Todos los derechos reservados.</p>
            <Link href="/embed" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Instalar widget →
            </Link>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </main>
  );
}
