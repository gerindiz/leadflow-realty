import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { chatWithSofia, extractLeadFromResponse, ChatMessage } from '../services/openai.service';
import { calcularScore, normalizarUrgencia, normalizarTipoOperacion } from '../services/scoring.service';
import { enviarNotificacionLead } from '../services/email.service';

const router = Router();
const prisma = new PrismaClient();

// Almacena historial de conversaciones en memoria (en producción usar Redis)
const sesiones = new Map<string, ChatMessage[]>();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { sessionId, mensaje } = req.body as { sessionId?: string; mensaje: string };

    if (!mensaje) {
      return res.status(400).json({ error: 'El campo mensaje es requerido' });
    }

    const sid = sessionId ?? uuidv4();
    const historial = sesiones.get(sid) ?? [];

    historial.push({ role: 'user', content: mensaje });

    const respuesta = await chatWithSofia(historial);
    historial.push({ role: 'assistant', content: respuesta });
    sesiones.set(sid, historial);

    // Verificar si se capturó el lead
    const leadDatos = extractLeadFromResponse(respuesta);
    let leadId: string | undefined;

    if (leadDatos) {
      const urgencia = normalizarUrgencia(String(leadDatos.urgencia ?? ''));
      const tipoOperacion = normalizarTipoOperacion(String(leadDatos.tipoOperacion ?? ''));

      const zonas = Array.isArray(leadDatos.zonas)
        ? (leadDatos.zonas as string[])
        : leadDatos.zonas
        ? [String(leadDatos.zonas)]
        : [];

      const score = calcularScore({
        email: String(leadDatos.email ?? ''),
        telefono: String(leadDatos.telefono ?? ''),
        urgencia,
        tipoOperacion,
        presupuestoMax: Number(leadDatos.presupuestoMax) || undefined,
        tieneFinanciamiento: Boolean(leadDatos.tieneFinanciamiento),
        zonas,
      });

      const estado = score >= 70 ? 'CALIFICADO' : 'NUEVO';

      const lead = await prisma.lead.create({
        data: {
          nombre: String(leadDatos.nombre ?? 'Sin nombre'),
          email: String(leadDatos.email ?? ''),
          telefono: String(leadDatos.telefono ?? ''),
          tipoOperacion,
          presupuestoMin: Number(leadDatos.presupuestoMin) || null,
          presupuestoMax: Number(leadDatos.presupuestoMax) || null,
          zonas,
          ambientes: Number(leadDatos.ambientes) || null,
          tieneFinanciamiento: Boolean(leadDatos.tieneFinanciamiento),
          urgencia,
          score,
          estado,
          canalOrigen: 'WEB',
          conversaciones: {
            create: {
              mensajes: historial as unknown as import('@prisma/client').Prisma.InputJsonValue,
            },
          },
        },
      });

      leadId = lead.id;
      sesiones.delete(sid);

      if (score >= 70) {
        enviarNotificacionLead({
          id: lead.id,
          nombre: lead.nombre,
          email: lead.email,
          telefono: lead.telefono,
          tipoOperacion: lead.tipoOperacion,
          zonas: lead.zonas,
          ambientes: lead.ambientes,
          presupuestoMin: lead.presupuestoMin,
          presupuestoMax: lead.presupuestoMax,
          tieneFinanciamiento: lead.tieneFinanciamiento,
          urgencia: lead.urgencia,
          score: lead.score,
        }).catch(err => console.error('[Email] Error enviando notificación:', err));
      }
    }

    // Limpiar el JSON del mensaje visible al usuario
    const mensajeLimpio = respuesta
      .replace(/\{[\s\S]*"leadCapturado"\s*:\s*true[\s\S]*\}/g, '')
      .trim();

    return res.json({
      sessionId: sid,
      respuesta: mensajeLimpio,
      leadCapturado: !!leadDatos,
      leadId,
    });
  } catch (error) {
    console.error('[Chat] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
