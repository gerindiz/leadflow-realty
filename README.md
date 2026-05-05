# 🏠 LeadFlow Realty — AI-Powered Real Estate Lead Generation Platform

<div align="center">

![LeadFlow Realty](https://img.shields.io/badge/LeadFlow-Realty-10b981?style=for-the-badge&logo=house&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Railway-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Anthropic](https://img.shields.io/badge/Claude-Sonnet_4.5-D97706?style=for-the-badge&logo=anthropic&logoColor=white)

**Sistema SaaS de captación y calificación de leads inmobiliarios con IA conversacional**

[🌐 Demo en vivo](https://leadflow-realty.vercel.app) · [📊 CRM Dashboard](https://leadflow-realty.vercel.app/dashboard) · [📖 API Docs](#api)

</div>

---

## 📌 Descripción

LeadFlow Realty es una plataforma SaaS B2B que automatiza el proceso completo de captación y calificación de leads inmobiliarios. Un chatbot con IA conversacional (Sofía) atiende consultas 24/7, califica leads automáticamente con un algoritmo de scoring propio, y notifica al equipo de ventas solo cuando un lead está listo para cerrar.

**Problema que resuelve:** Las inmobiliarias reciben cientos de consultas mensuales. El 80% son curiosos sin intención real de compra. Los agentes pierden horas respondiendo preguntas repetitivas mientras los leads calientes se enfrían. LeadFlow automatiza la calificación inicial y entrega al agente solo los leads con mayor probabilidad de conversión.

---

## ✨ Features

- 🤖 **Chatbot IA conversacional** — Sofía, asesora virtual powered by Claude Sonnet 4.5
- 📊 **Lead scoring automático** — algoritmo que asigna score 0-100 basado en comportamiento e intención
- 🎯 **CRM con pipeline kanban** — 6 etapas: Nuevo → Calificado → Visita → Negociación → Cerrado → Perdido
- 📈 **Analytics en tiempo real** — métricas de conversión, performance por canal y por agente
- 🔔 **Notificaciones automáticas** — email al agente cuando un lead supera score 70
- 📱 **Widget embebible** — se instala en cualquier web inmobiliaria con un script
- 🌙 **Multi-canal** — Web, WhatsApp, Instagram (arquitectura preparada)
- 📤 **Export CSV** — exportación de leads para integración con otros sistemas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CANALES DE ENTRADA                    │
│         Web Chat · WhatsApp · Instagram · Email         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   API GATEWAY                            │
│              Express · JWT · CORS                        │
└──────┬──────────────┬──────────────┬────────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼───────┐
│ Conversation│ │Lead Scoring│ │ Automation │
│   Service   │ │  Service   │ │   Engine   │
│ Claude API  │ │  ML Rules  │ │  Triggers  │
└──────┬──────┘ └─────┬──────┘ └────┬───────┘
       │              │              │
┌──────▼──────────────▼──────────────▼───────┐
│              DATABASE LAYER                  │
│    PostgreSQL (Railway) · Prisma ORM        │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Uso |
|-----------|-----|
| Node.js 22 + TypeScript | Runtime y tipado estático |
| Express.js | API REST |
| Prisma ORM | Database abstraction |
| PostgreSQL (Railway) | Base de datos principal |
| @anthropic-ai/sdk | IA conversacional |
| Nodemailer | Notificaciones email |
| UUID | Gestión de sesiones |

### Frontend
| Tecnología | Uso |
|-----------|-----|
| Next.js 14 (App Router) | Framework React |
| Tailwind CSS | Styling utility-first |
| TypeScript | Tipado estático |
| Recharts | Gráficos y analytics |

### Infraestructura
| Servicio | Uso |
|---------|-----|
| Vercel | Deploy frontend (CI/CD automático) |
| Railway | Deploy backend + PostgreSQL |
| GitHub | Control de versiones |
| Anthropic API | IA conversacional (Claude Sonnet 4.5) |

---

## 🚀 Instalación local

### Pre-requisitos
- Node.js 18+
- PostgreSQL (local o Railway)
- API Key de Anthropic

### 1. Clonar el repositorio
```bash
git clone https://github.com/gerindiz/leadflow-realty.git
cd leadflow-realty
```

### 2. Configurar el backend
```bash
cd backend
npm install
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:password@localhost:5432/leadflow
PORT=3001
NOTIFICATION_EMAIL=agente@inmobiliaria.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=tu-app-password
```

### 3. Migrar la base de datos
```bash
npx prisma migrate dev
```

### 4. Iniciar el backend
```bash
npm run dev
# → Server running on http://localhost:3001
```

### 5. Configurar el frontend
```bash
cd ../frontend
npm install
```

Crear `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 6. Iniciar el frontend
```bash
npm run dev
# → Ready on http://localhost:3000
```

---

## 📡 API Reference

### Chat
```http
POST /api/chat
Content-Type: application/json

{
  "sessionId": "uuid-de-sesion",
  "mensaje": "Hola, busco un departamento"
}
```

### Leads
```http
GET    /api/leads              # Lista todos los leads
GET    /api/leads/:id          # Detalle de un lead
POST   /api/leads              # Crear lead manualmente
PATCH  /api/leads/:id/estado   # Actualizar estado en pipeline
POST   /api/leads/:id/notas    # Agregar nota a un lead
GET    /api/leads/:id/timeline # Timeline de actividad
```

### Analytics
```http
GET /api/analytics/leads-por-dia        # Leads últimos 30 días
GET /api/analytics/conversion-por-canal # Conversión por canal
GET /api/analytics/performance-agentes  # Performance por agente
```

---

## 🧮 Algoritmo de Lead Scoring

```typescript
function calcularScore(lead: Lead): number {
  let score = 0;

  // Datos de contacto completos
  if (lead.email && lead.telefono) score += 20;

  // Urgencia
  if (lead.urgencia === 'INMEDIATA') score += 15;
  if (lead.urgencia === '3MESES')    score += 10;

  // Tipo de operación
  if (['COMPRA', 'INVERSION'].includes(lead.tipoOperacion)) score += 20;
  if (lead.tipoOperacion === 'ALQUILER') score += 10;

  // Capacidad financiera
  if (lead.presupuestoMax)          score += 15;
  if (!lead.tieneFinanciamiento)    score += 10;

  // Segmentación geográfica
  if (lead.zonas?.length > 0)       score += 10;

  return Math.min(score, 100);
}
```

**Leads con score ≥ 70** disparan notificación automática al agente.

---

## 📁 Estructura del proyecto

```
leadflow-realty/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Modelos de datos
│   ├── src/
│   │   ├── routes/
│   │   │   ├── chat.routes.ts
│   │   │   ├── leads.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── config.routes.ts
│   │   ├── services/
│   │   │   ├── openai.service.ts   # Integración Claude API
│   │   │   ├── scoring.service.ts  # Algoritmo de scoring
│   │   │   └── email.service.ts    # Notificaciones
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx        # Dashboard principal
│   │   │   │   ├── leads/          # Gestión de leads
│   │   │   │   ├── pipeline/       # Kanban pipeline
│   │   │   │   ├── analytics/      # Métricas y gráficos
│   │   │   │   └── configuracion/  # Configuración
│   │   │   └── page.tsx            # Landing page
│   │   └── components/
│   │       ├── ChatWidget.tsx      # Widget de chat embebible
│   │       ├── Sidebar.tsx
│   │       ├── LeadDetailPanel.tsx
│   │       └── charts/
└── README.md
```

---

## 🌐 Deploy

### Frontend — Vercel
```bash
# Conectar repo a Vercel y configurar:
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
```

### Backend — Railway
```bash
# Root directory: backend
# Variables de entorno configuradas en Railway dashboard
```

---

## 📊 Modelo de negocio

| Plan | Precio | Conversaciones | Agentes |
|------|--------|---------------|---------|
| Starter | $199/mes | 500/mes | 1 |
| Growth | $499/mes | 3.000/mes | 5 |
| Enterprise | $1.499/mes | Ilimitadas | Ilimitados |

---

## 🔮 Roadmap

- [ ] Integración WhatsApp Business API
- [ ] Integración Instagram DM
- [ ] HubSpot / Salesforce sync
- [ ] Modelo ML de scoring con datos históricos
- [ ] Agendado automático de visitas (Google Calendar)
- [ ] App mobile para agentes
- [ ] Multi-tenant con onboarding self-service

---

## 👤 Autor

**German Rindizbacher**
- GitHub: [@gerindiz](https://github.com/gerindiz)
- LinkedIn: [german-dario-rindizbacher](https://linkedin.com/in/german-dario-rindizbacher)

---

## 📄 Licencia

MIT © 2026 German Rindizbacher
