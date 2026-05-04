import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export interface LeadNotification {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipoOperacion: string;
  zonas: string[];
  ambientes?: number | null;
  presupuestoMin?: number | null;
  presupuestoMax?: number | null;
  tieneFinanciamiento: boolean;
  urgencia: string;
  score: number;
}

export async function enviarNotificacionLead(lead: LeadNotification): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email] SMTP no configurado, omitiendo notificación para lead:', lead.id);
    return;
  }

  const transporter = createTransporter();
  const destinatario = process.env.NOTIFICATION_EMAIL ?? process.env.SMTP_USER;

  const presupuesto = lead.presupuestoMin && lead.presupuestoMax
    ? `$${lead.presupuestoMin.toLocaleString()} - $${lead.presupuestoMax.toLocaleString()}`
    : lead.presupuestoMax
    ? `Hasta $${lead.presupuestoMax.toLocaleString()}`
    : 'No especificado';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🏠 Nuevo Lead Calificado</h1>
        <p style="color: #dcfce7; margin: 5px 0 0;">Score: <strong>${lead.score}/100</strong></p>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #111827; margin-top: 0;">Datos del Contacto</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Nombre:</td><td style="padding: 8px 0; font-weight: 600;">${lead.nombre}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Teléfono:</td><td style="padding: 8px 0;"><a href="tel:${lead.telefono}">${lead.telefono}</a></td></tr>
        </table>

        <h2 style="color: #111827;">Búsqueda</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Operación:</td><td style="padding: 8px 0; font-weight: 600;">${lead.tipoOperacion}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Zonas:</td><td style="padding: 8px 0;">${lead.zonas.join(', ') || 'No especificado'}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Ambientes:</td><td style="padding: 8px 0;">${lead.ambientes ?? 'No especificado'}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Presupuesto:</td><td style="padding: 8px 0;">${presupuesto}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Financiamiento:</td><td style="padding: 8px 0;">${lead.tieneFinanciamiento ? 'Necesita financiamiento' : 'Pago al contado'}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Urgencia:</td><td style="padding: 8px 0;">${lead.urgencia}</td></tr>
        </table>

        <div style="margin-top: 20px; padding: 16px; background: #ecfdf5; border-radius: 6px; border: 1px solid #6ee7b7;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">
            ⚡ Este lead tiene un <strong>score de ${lead.score}/100</strong>.
            Se recomienda contacto en las próximas 2 horas.
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"LeadFlow Realty" <${process.env.SMTP_USER}>`,
    to: destinatario,
    subject: `🔥 Lead calificado: ${lead.nombre} (Score ${lead.score}/100)`,
    html,
  });

  console.log(`[Email] Notificación enviada a ${destinatario} para lead ${lead.id}`);
}
