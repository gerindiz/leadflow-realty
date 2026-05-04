import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/config
router.get('/', async (_req: Request, res: Response) => {
  try {
    let config = await prisma.config.findUnique({ where: { id: 'singleton' } });
    if (!config) {
      config = await prisma.config.create({ data: { id: 'singleton' } });
    }
    return res.json(config);
  } catch (error) {
    console.error('[Config] Error obteniendo config:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/config
router.put('/', async (req: Request, res: Response) => {
  try {
    const { nombreAgencia, nombreBot, scoreUmbral, horarioInicio, horarioFin } = req.body as {
      nombreAgencia?: string;
      nombreBot?: string;
      scoreUmbral?: number;
      horarioInicio?: string;
      horarioFin?: string;
    };

    const config = await prisma.config.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        nombreAgencia: nombreAgencia ?? 'Mi Inmobiliaria',
        nombreBot: nombreBot ?? 'Sofía',
        scoreUmbral: scoreUmbral ?? 70,
        horarioInicio: horarioInicio ?? '08:00',
        horarioFin: horarioFin ?? '20:00',
      },
      update: {
        ...(nombreAgencia !== undefined && { nombreAgencia }),
        ...(nombreBot !== undefined && { nombreBot }),
        ...(scoreUmbral !== undefined && { scoreUmbral: Number(scoreUmbral) }),
        ...(horarioInicio !== undefined && { horarioInicio }),
        ...(horarioFin !== undefined && { horarioFin }),
      },
    });

    return res.json(config);
  } catch (error) {
    console.error('[Config] Error guardando config:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
