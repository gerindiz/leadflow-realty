export interface LeadData {
  email?: string;
  telefono?: string;
  urgencia?: string;
  tipoOperacion?: string;
  presupuestoMax?: number;
  tieneFinanciamiento?: boolean;
  zonas?: string[];
}

export function calcularScore(datos: LeadData): number {
  let score = 0;

  if (datos.email && datos.telefono) score += 20;

  if (datos.urgencia === 'INMEDIATA') score += 15;
  else if (datos.urgencia === 'TRES_MESES' || datos.urgencia === '3MESES') score += 10;

  if (datos.tipoOperacion === 'COMPRA' || datos.tipoOperacion === 'INVERSION') score += 20;
  else if (datos.tipoOperacion === 'ALQUILER') score += 10;

  if (datos.presupuestoMax && datos.presupuestoMax > 0) score += 15;

  if (datos.tieneFinanciamiento === false) score += 10;

  if (datos.zonas && datos.zonas.length > 0 && datos.zonas[0] !== '') score += 10;

  return Math.min(score, 100);
}

export function normalizarUrgencia(urgencia: string): 'INMEDIATA' | 'TRES_MESES' | 'SEIS_MESES' | 'SIN_DEFINIR' {
  const u = urgencia?.toUpperCase() ?? '';
  if (u.includes('INMEDIATA') || u.includes('YA') || u.includes('AHORA')) return 'INMEDIATA';
  if (u.includes('3') || u.includes('TRES')) return 'TRES_MESES';
  if (u.includes('6') || u.includes('SEIS')) return 'SEIS_MESES';
  return 'SIN_DEFINIR';
}

export function normalizarTipoOperacion(tipo: string): 'COMPRA' | 'ALQUILER' | 'INVERSION' {
  const t = tipo?.toUpperCase() ?? '';
  if (t.includes('COMPRA') || t.includes('COMPRAR')) return 'COMPRA';
  if (t.includes('INVERSION') || t.includes('INVERSI')) return 'INVERSION';
  return 'ALQUILER';
}
