import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LeadFlow Realty — Captación de Leads Inmobiliarios con IA',
  description: 'Sistema inteligente de captación y calificación de leads inmobiliarios. Chatbot IA 24/7, CRM integrado y notificaciones automáticas.',
  keywords: 'leads inmobiliarios, chatbot inmobiliaria, CRM inmobiliario, captación de clientes, IA inmobiliaria',
  authors: [{ name: 'LeadFlow Realty' }],
  openGraph: {
    title: 'LeadFlow Realty — Captación de Leads con IA',
    description: 'Calificá leads inmobiliarios automáticamente con inteligencia artificial. Más ventas, menos esfuerzo.',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadFlow Realty',
    description: 'Captación de leads inmobiliarios con IA',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏠</text></svg>" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
