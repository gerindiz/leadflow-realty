import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/leads-por-dia
router.get('/leads-por-dia', async (_req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const leads = await prisma.lead.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const counts: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      counts[d.toISOString().slice(0, 10)] = 0;
    }
    for (const l of leads) {
      const key = l.createdAt.toISOString().slice(0, 10);
      if (key in counts) counts[key]++;
    }

    return res.json(Object.entries(counts).map(([fecha, total]) => ({ fecha, total })));
  } catch (error) {
    console.error('[Analytics] leads-por-dia error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/analytics/conversion-por-canal
router.get('/conversion-por-canal', async (_req: Request, res: Response) => {
  try {
    const canales = ['WEB', 'WHATSAPP', 'INSTAGRAM'] as const;
    const results = await Promise.all(
      canales.map(async canal => {
        const total = await prisma.lead.count({ where: { canalOrigen: canal } });
        const calificados = await prisma.lead.count({ where: { canalOrigen: canal, score: { gte: 70 } } });
        return { canal, total, calificados, tasa: total > 0 ? calificados / total : 0 };
      })
    );
    return res.json(results.filter(r => r.total > 0));
  } catch (error) {
    console.error('[Analytics] conversion-por-canal error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/analytics/performance-agentes
router.get('/performance-agentes', async (_req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { agenteAsignado: { not: null } },
      select: { agenteAsignado: true, score: true, estado: true },
    });

    const map: Record<string, { total: number; calificados: number; cerrados: number }> = {};
    for (const l of leads) {
      const a = l.agenteAsignado!;
      if (!map[a]) map[a] = { total: 0, calificados: 0, cerrados: 0 };
      map[a].total++;
      if (l.score >= 70) map[a].calificados++;
      if (l.estado === 'CERRADO') map[a].cerrados++;
    }

    return res.json(
      Object.entries(map).map(([agente, v]) => ({ agente, ...v }))
    );
  } catch (error) {
    console.error('[Analytics] performance-agentes error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
