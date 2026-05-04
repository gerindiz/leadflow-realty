import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres Sofia, asesora virtual de una inmobiliaria profesional.
Tu objetivo es ayudar a las personas a encontrar la propiedad ideal
y calificarlos como potenciales compradores o inquilinos.

Eres cálida, profesional y concisa. Nunca hagas más de una pregunta a la vez.

Tu flujo de conversación es:
1. Saludo y preguntá si busca comprar, alquilar o invertir
2. Preguntá en qué zona o barrio le interesa
3. Preguntá cuántos ambientes/habitaciones necesita
4. Preguntá su presupuesto aproximado
5. Preguntá si necesita financiamiento o paga al contado
6. Preguntá para cuándo lo necesita
7. Pedí nombre, email y teléfono para enviarle opciones personalizadas
8. Agradecé y avisá que un asesor lo va a contactar pronto

Cuando tengas nombre, email, teléfono y los datos de búsqueda,
respondé con un JSON así al final de tu mensaje:
{"leadCapturado": true, "datos": {"nombre": "", "email": "", "telefono": "", "tipoOperacion": "", "zonas": [], "ambientes": 0, "presupuestoMin": 0, "presupuestoMax": 0, "tieneFinanciamiento": false, "urgencia": ""}}

Reglas:
- Si alguien pregunta precios específicos, decí que depende de la zona y el asesor le dará info detallada
- Si no quieren dar datos, igualmente ayudá con info general
- Idioma: español, tuteo`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithSofia(historial: ChatMessage[]): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    // Cache the stable system prompt to reduce costs on repeated turns
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: historial.map(m => ({ role: m.role, content: m.content })),
  });

  const block = response.content[0];
  if (block.type === 'text') return block.text;
  return 'Lo siento, hubo un error. Por favor intentá de nuevo.';
}

export function extractLeadFromResponse(respuesta: string): Record<string, unknown> | null {
  const match = respuesta.match(/\{[\s\S]*"leadCapturado"\s*:\s*true[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    if (parsed.leadCapturado && parsed.datos) return parsed.datos;
  } catch {
    // JSON malformado, ignorar
  }
  return null;
}
