# LeadFlow Realty 🏠

Sistema de captación y calificación de leads inmobiliarios con chatbot IA (Sofía).

## Stack
- **Backend**: Node.js + TypeScript + Express + Prisma + OpenAI
- **Frontend**: Next.js 14 + Tailwind CSS
- **Base de datos**: PostgreSQL

---

## Instalación

### 1. Requisitos previos
- Node.js 18+
- PostgreSQL corriendo localmente (o en la nube)
- Cuenta en [OpenAI](https://platform.openai.com)

### 2. Clonar e instalar dependencias

```bash
# Instalar dependencias de backend y frontend
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el ejemplo
cp backend/.env.example backend/.env
```

Editá `backend/.env` con tus valores reales:

```env
OPENAI_API_KEY=sk-proj-...        # Tu API key de OpenAI
DATABASE_URL=postgresql://usuario:password@localhost:5432/leadflow
PORT=3001
NOTIFICATION_EMAIL=agente@inmobiliaria.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx    # App Password de Gmail
```

### 4. Configurar la base de datos

```bash
cd backend

# Generar el cliente Prisma
npm run db:generate

# Crear las tablas (requiere PostgreSQL corriendo)
npm run db:migrate
```

### 5. Levantar el proyecto

**Opción A – Terminal único (Windows):**
```bash
# Backend (terminal 1)
cd backend && npm run dev

# Frontend (terminal 2)
cd frontend && npm run dev
```

**Opción B – Con concurrently instalado:**
```bash
npm run dev
```

### 6. Acceder

| URL | Descripción |
|-----|-------------|
| http://localhost:3000 | Landing page con chat de Sofía |
| http://localhost:3000/dashboard | CRM con pipeline Kanban |
| http://localhost:3001/health | Health check del backend |

---

## Configuración manual requerida

### OpenAI
1. Ir a https://platform.openai.com/api-keys
2. Crear una nueva API key
3. Pegarla en `backend/.env` como `OPENAI_API_KEY`
4. Asegurate de tener créditos en tu cuenta

### PostgreSQL
- **Local**: `CREATE DATABASE leadflow;` en psql
- **Nube**: Podés usar Supabase (gratis), Railway, o Neon
- Actualizá `DATABASE_URL` con la cadena de conexión

### Gmail SMTP (para notificaciones)
1. Activá verificación en 2 pasos en tu cuenta Google
2. Ir a Seguridad → Contraseñas de aplicaciones
3. Crear una nueva para "Correo" → copiar los 16 caracteres
4. Pegarlo en `SMTP_PASS`

---

## Algoritmo de Lead Scoring

| Condición | Puntos |
|-----------|--------|
| Tiene email Y teléfono | +20 |
| Urgencia INMEDIATA | +15 |
| Urgencia 3 MESES | +10 |
| Tipo: COMPRA o INVERSIÓN | +20 |
| Tipo: ALQUILER | +10 |
| Presupuesto máximo definido | +15 |
| Pago al contado (sin financiamiento) | +10 |
| Zona específica definida | +10 |
| **TOTAL** | **100** |

Leads con score ≥ 70 reciben notificación por email automática al agente.

---

## API Reference

```
POST /api/chat                     Chat con Sofía
  Body: { sessionId?, mensaje }
  Returns: { sessionId, respuesta, leadCapturado, leadId? }

GET  /api/leads                    Lista de leads
  Query: canal?, agente?, estado?, scoreMin?

GET  /api/leads/:id                Detalle de lead + conversación

POST /api/leads                    Crear lead manual

PATCH /api/leads/:id/estado        Mover lead en el pipeline
  Body: { estado, agenteAsignado? }
```
