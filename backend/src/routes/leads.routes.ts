import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/leads - Lista todos los leads con filtros opcionales
router.get('/', async (req: Request, res: Response) => {
  try {
    const { canal, agente, estado, scoreMin } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (canal) where.canalOrigen = canal;
    if (agente) where.agenteAsignado = agente;
    if (estado) where.estado = estado;
    if (scoreMin) where.score = { gte: Number(scoreMin) };

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        tipoOperacion: true,
        presupuestoMin: true,
        presupuestoMax: true,
        zonas: true,
        ambientes: true,
        tieneFinanciamiento: true,
        urgencia: true,
        score: true,
        estado: true,
        canalOrigen: true,
        agenteAsignado: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { conversaciones: true } },
      },
    });

    return res.json({ leads, total: leads.length });
  } catch (error) {
    console.error('[Leads] Error listando leads:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/leads/:id - Detalle de un lead con su conversación
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        conversaciones: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

    return res.json(lead);
  } catch (error) {
    console.error('[Leads] Error obteniendo lead:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/leads - Guarda un lead manualmente
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      nombre, email, telefono, tipoOperacion,
      presupuestoMin, presupuestoMax, zonas,
      ambientes, tieneFinanciamiento, urgencia,
      canalOrigen, agenteAsignado,
    } = req.body as Record<string, unknown>;

    if (!nombre || !email || !telefono || !tipoOperacion) {
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre, email, telefono, tipoOperacion' });
    }

    const lead = await prisma.lead.create({
      data: {
        nombre: String(nombre),
        email: String(email),
        telefono: String(telefono),
        tipoOperacion: tipoOperacion as 'COMPRA' | 'ALQUILER' | 'INVERSION',
        presupuestoMin: presupuestoMin ? Number(presupuestoMin) : null,
        presupuestoMax: presupuestoMax ? Number(presupuestoMax) : null,
        zonas: Array.isArray(zonas) ? zonas as string[] : [],
        ambientes: ambientes ? Number(ambientes) : null,
        tieneFinanciamiento: Boolean(tieneFinanciamiento),
        urgencia: (urgencia as 'INMEDIATA' | 'TRES_MESES' | 'SEIS_MESES' | 'SIN_DEFINIR') ?? 'SIN_DEFINIR',
        canalOrigen: (canalOrigen as 'WEB' | 'WHATSAPP' | 'INSTAGRAM') ?? 'WEB',
        agenteAsignado: agenteAsignado ? String(agenteAsignado) : null,
      },
    });

    return res.status(201).json(lead);
  } catch (error) {
    console.error('[Leads] Error creando lead:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/leads/export/csv
router.get('/export/csv', async (_req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    const headers = ['id', 'nombre', 'email', 'telefono', 'tipoOperacion', 'score', 'estado', 'canalOrigen', 'agenteAsignado', 'createdAt'];
    const rows = leads.map(l =>
      headers.map(h => {
        const v = (l as Record<string, unknown>)[h];
        return `"${String(v ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('[Leads] Error exportando CSV:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/leads/:id/notas
router.post('/:id/notas', async (req: Request, res: Response) => {
  try {
    const { contenido, autor } = req.body as { contenido: string; autor?: string };
    if (!contenido) return res.status(400).json({ error: 'Contenido requerido' });
    const nota = await prisma.nota.create({
      data: { leadId: req.params.id, contenido, autor: autor ?? null },
    });
    return res.status(201).json(nota);
  } catch (error) {
    console.error('[Leads] Error creando nota:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/leads/:id/timeline
router.get('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const [lead, notas] = await Promise.all([
      prisma.lead.findUnique({ where: { id: req.params.id }, include: { conversaciones: { orderBy: { createdAt: 'asc' } } } }),
      prisma.nota.findMany({ where: { leadId: req.params.id }, orderBy: { createdAt: 'asc' } }),
    ]);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

    const items: { tipo: string; descripcion: string; fecha: string; meta?: Record<string, unknown> }[] = [
      { tipo: 'CREACION', descripcion: 'Lead creado via ' + lead.canalOrigen, fecha: lead.createdAt.toISOString() },
      ...lead.conversaciones.map(c => ({
        tipo: 'CONVERSACION',
        descripcion: 'Conversación con Sofía',
        fecha: c.createdAt.toISOString(),
        meta: { mensajes: (c.mensajes as unknown[]).length },
      })),
      ...notas.map(n => ({
        tipo: 'NOTA',
        descripcion: n.contenido,
        fecha: n.createdAt.toISOString(),
        meta: { autor: n.autor },
      })),
    ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return res.json(items);
  } catch (error) {
    console.error('[Leads] Error obteniendo timeline:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/leads/:id/estado - Actualiza el estado del lead en el pipeline
router.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { estado, agenteAsignado } = req.body as { estado: string; agenteAsignado?: string };

    const estadosValidos = ['NUEVO', 'CALIFICADO', 'VISITA_AGENDADA', 'NEGOCIACION', 'CERRADO', 'PERDIDO'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` });
    }

    const data: Record<string, unknown> = { estado };
    if (agenteAsignado !== undefined) data.agenteAsignado = agenteAsignado;

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data,
    });

    return res.json(lead);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }
    console.error('[Leads] Error actualizando estado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
