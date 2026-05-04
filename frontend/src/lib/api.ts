const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipoOperacion: 'COMPRA' | 'ALQUILER' | 'INVERSION';
  presupuestoMin: number | null;
  presupuestoMax: number | null;
  zonas: string[];
  ambientes: number | null;
  tieneFinanciamiento: boolean;
  urgencia: 'INMEDIATA' | 'TRES_MESES' | 'SEIS_MESES' | 'SIN_DEFINIR';
  score: number;
  estado: 'NUEVO' | 'CALIFICADO' | 'VISITA_AGENDADA' | 'NEGOCIACION' | 'CERRADO' | 'PERDIDO';
  canalOrigen: 'WEB' | 'WHATSAPP' | 'INSTAGRAM';
  agenteAsignado: string | null;
  createdAt: string;
  updatedAt: string;
  conversaciones?: Array<{ id: string; mensajes: ChatMessage[]; createdAt: string }>;
  notas?: Nota[];
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface Nota { id: string; leadId: string; contenido: string; autor: string | null; createdAt: string }

export interface LeadsPorDia { fecha: string; total: number }
export interface ConversionCanal { canal: string; total: number; calificados: number; tasa: number }
export interface PerformanceAgente { agente: string; total: number; calificados: number; cerrados: number }
export interface TimelineItem { tipo: string; descripcion: string; fecha: string; meta?: Record<string, unknown> }
export interface Config {
  id: string;
  nombreAgencia: string;
  nombreBot: string;
  scoreUmbral: number;
  horarioInicio: string;
  horarioFin: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Chat ──
export async function sendChatMessage(sessionId: string | null, mensaje: string) {
  return apiFetch<{ sessionId: string; respuesta: string; leadCapturado: boolean; leadId?: string }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, mensaje }),
  });
}

// ── Leads ──
export async function getLeads(filters?: Record<string, string>) {
  const q = filters ? '?' + new URLSearchParams(filters) : '';
  return apiFetch<{ leads: Lead[]; total: number }>(`/api/leads${q}`);
}
export async function getLead(id: string) { return apiFetch<Lead>(`/api/leads/${id}`); }
export async function updateLeadEstado(id: string, estado: string, agenteAsignado?: string) {
  return apiFetch<Lead>(`/api/leads/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado, agenteAsignado }) });
}
export async function addNota(leadId: string, contenido: string, autor?: string) {
  return apiFetch<Nota>(`/api/leads/${leadId}/notas`, { method: 'POST', body: JSON.stringify({ contenido, autor }) });
}
export async function getTimeline(leadId: string) {
  return apiFetch<TimelineItem[]>(`/api/leads/${leadId}/timeline`);
}
export function exportLeadsCSV() {
  window.open(`${API_BASE}/api/leads/export/csv`, '_blank');
}

// ── Analytics ──
export async function getLeadsPorDia() { return apiFetch<LeadsPorDia[]>('/api/analytics/leads-por-dia'); }
export async function getConversionPorCanal() { return apiFetch<ConversionCanal[]>('/api/analytics/conversion-por-canal'); }
export async function getPerformanceAgentes() { return apiFetch<PerformanceAgente[]>('/api/analytics/performance-agentes'); }

// ── Config ──
export async function getConfig() { return apiFetch<Config>('/api/config'); }
export async function saveConfig(data: Partial<Config>) {
  return apiFetch<Config>('/api/config', { method: 'PUT', body: JSON.stringify(data) });
}
