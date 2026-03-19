import { NextRequest, NextResponse } from 'next/server';

/**
 * Wizard de Socios — AI Report Generator
 * POST body: { socios: [{nombre, respuestas}] }
 * Returns: { report: string } — markdown text
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { socios } = body;
  if (!socios || !Array.isArray(socios) || socios.length === 0) {
    return NextResponse.json({ error: 'socios array is required' }, { status: 400 });
  }

  const systemPrompt = `Eres un consultor experto en cooperativas agroalimentarias y acuerdos de socios para startups agrarias.
Trabajas para NeoFarm/OvoSfera, un proyecto de avicultura heritage de selección en Palazuelos de Eresma, Segovia.

Se te proporcionarán las respuestas individuales y CONFIDENCIALES de cada socio (recopiladas a través de un wizard digital).
Tu misión es:

1. ANALIZAR las respuestas de los 3 socios buscando:
   - Puntos de convergencia (ideas compartidas, visión común)
   - Puntos de divergencia (diferencias de opinión, expectativas distintas)
   - Complementariedad de perfiles y aportaciones
   - Posibles focos de conflicto futuro
   - Equilibrio de dedicación, inversión y reparto

2. RECOMENDAR:
   - Un modelo organizativo óptimo para este equipo
   - Distribución de roles y responsabilidades
   - Mecanismo de toma de decisiones consensuado
   - KPIs compartidos vs. individuales
   - Plan de contingencia ante riesgos identificados
   - Hoja de ruta de los primeros 12 meses

3. PROPONER un BORRADOR DE ACUERDO DE SOCIOS que incluya:
   - Objeto social y misión compartida
   - Roles y responsabilidades de cada socio
   - Régimen de dedicación (horas, tareas)
   - Aportaciones de cada socio (capital, terreno, trabajo, conocimiento)
   - Mecanismo de toma de decisiones
   - Reparto de beneficios y pérdidas
   - Causas de disolución
   - Cláusula de resolución de conflictos
   - Periodo de prueba (recomendado)

FORMATO DE RESPUESTA:
Responde en MARKDOWN bien estructurado en ESPAÑOL. Usa ## para secciones principales y ### para subsecciones.
Sé concreto, práctico y directo. Esto va a 3 personas reales que van a montar un negocio juntas.

Secciones obligatorias:
## Análisis Comparativo de Respuestas
## Puntos de Convergencia
## Puntos de Divergencia y Riesgos
## Recomendaciones Organizativas
## Hoja de Ruta — Primeros 12 Meses
## Borrador de Acuerdo de Socios
## Próximos Pasos`;

  const userMessage = `RESPUESTAS CONFIDENCIALES DEL WIZARD DE SOCIOS
============================================

${socios.map((s: any, i: number) => `
### SOCIO ${i + 1}: ${s.nombre}

**RONDA 1 — Visión y Compromiso:**
- Disponibilidad semanal: ${s.r1?.disponibilidad || 'No respondido'}
- Horarios preferidos: ${s.r1?.horarios || 'No respondido'}
- Motivación principal: ${s.r1?.motivacion || 'No respondido'}
- Experiencia previa: ${s.r1?.experiencia || 'No respondido'}

**RONDA 2 — Organización y Economía:**
- Inversión inicial dispuesto: ${s.r2?.inversion || 'No respondido'}
- Modelo de toma de decisiones preferido: ${s.r2?.decisiones || 'No respondido'}
- Reparto de beneficios preferido: ${s.r2?.reparto || 'No respondido'}
- Modelo de dedicación: ${s.r2?.dedicacion || 'No respondido'}

**RONDA 3 — Estrategia y Negocio:**
- Línea de negocio prioritaria: ${s.r3?.linea_negocio || 'No respondido'}
- Cliente objetivo: ${s.r3?.cliente || 'No respondido'}
- Objetivo a 1 año: ${s.r3?.objetivo_1y || 'No respondido'}
- Mayor riesgo percibido: ${s.r3?.riesgo || 'No respondido'}
- Cuestiones adicionales: ${s.r3?.cuestiones || 'Ninguna'}
`).join('\n---\n')}

Genera un informe completo analizando estas respuestas, con recomendaciones concretas y un borrador de acuerdo de socios. Ten en cuenta que el proyecto es de avicultura heritage de selección (capones, pulardas, razas autóctonas) en Segovia.`;

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Claude API error:', res.status, errText);
      return NextResponse.json({ error: `Claude API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    return NextResponse.json({ report: text });
  } catch (err: any) {
    console.error('Wizard report error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
