import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Breeding Recommender — calls Claude API with full flock data
 * and genetic metrics to produce a readable breeding plan in Spanish.
 *
 * POST body: { birds, weights, traits, breeds_catalog, objectives }
 * Returns: { recommendation: string } — formatted markdown text
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

  const { birds, weights, traits, breeds_catalog, objectives } = body;
  if (!birds || !Array.isArray(birds)) {
    return NextResponse.json({ error: 'birds array is required' }, { status: 400 });
  }

  const machos = birds.filter((b: any) => b.sexo === 'M' && b.estadoProductivo === 'activo');
  const hembras = birds.filter((b: any) => b.sexo === 'F' && b.estadoProductivo === 'activo');
  const razas = [...new Set(birds.map((b: any) => b.raza))];

  const birdsSummary = birds
    .filter((b: any) => b.estadoProductivo === 'activo')
    .map((b: any) => ({
      anilla: b.anilla,
      sexo: b.sexo,
      raza: b.raza,
      linea: b.linea,
      generacion: b.generacion,
      peso_kg: b.pesoActual,
      conformacion_pecho: b.conformacionPecho,
      conformacion_muslo: b.conformacionMuslo,
      docilidad: b.docilidad,
      autosexing: b.autoSexing,
      cinco_dedos: b.cincoDedos,
      color_plumaje: b.colorPlumaje,
      seleccion_score: b.selectionScore,
      coi: b.coi,
      estado_seleccion: b.estadoSeleccion,
      destino: b.destinoRecomendado,
      padre: b.padreId,
      madre: b.madreId,
      origen: b.origen,
    }));

  const systemPrompt = `Eres un genetista avícola experto especializado en avicultura de selección heritage para producción gourmet (capones, pulardas, picantones). 
Trabajas para NeoFarm/OvoSfera, una plataforma de gestión avícola en Segovia, España (clima continental, altitud 1000m).

CONTEXTO DEL PROGRAMA:
- Programa de selección genética para aves heritage de carne gourmet
- Objetivo final: capón gourmet heritage de 3-5 kg con carne infiltrada
- El programa busca crear líneas estables F0→F5+ con rasgos fijados
- Ubicación: Palazuelos de Eresma, Segovia (continental frío, pastoreo extensivo)

CRITERIOS DE SELECCIÓN (pesos del índice):
${weights ? weights.map((w: any) => `- ${w.criterio}: peso ${w.peso} — ${w.descripcion}`).join('\n') : 'Standard weights'}

RASGOS OBJETIVO:
${traits ? traits.map((t: any) => `- ${t.nombre} (${t.categoria}): ${t.comoSeEvalua}`).join('\n') : 'Standard traits'}

INSTRUCCIONES DE FORMATO:
Responde SIEMPRE en texto plano legible en español, con formato markdown. NO devuelvas JSON.
Usa esta estructura de secciones (con los títulos exactos precedidos por ##):

## Resumen Ejecutivo
(Párrafo resumen del plan: cuántos gallineros, estrategia general, objetivo)

## Gallineros de Cría Recomendados

### Gallinero 1: [Nombre de la línea]
**Objetivo:** (qué busca esta línea)
**Gallo:** [anilla] — [raza] — Score: [X]
**Justificación del gallo:** (por qué este gallo para esta línea)
**Gallinas asignadas:**
- [anilla] — [raza] — Score: [X] — (justificación breve)
- [anilla] — [raza] — Score: [X] — (justificación breve)
- ...
**Ratio:** 1:N
**Rasgos prioritarios a fijar:** (lista)
**F1 esperada:** (descripción de la descendencia esperada)
**Riesgos:** (posibles problemas)

### Gallinero 2: [Nombre]
(misma estructura)
...

## Gallos sin Asignar
- [anilla] — Rol: [Reserva/Rotación/Descarte] — (motivo)

## Plan de Consanguinidad
(Estrategia para evitar endogamia, rotaciones previstas, COI medio actual)

## Roadmap Generacional
**F1:** (cruces, criterios de selección, objetivo)
**F2:** (cruces, criterios de selección, objetivo)  
**F3:** (cruces, criterios de selección, objetivo)

## Nutrición Reproductores
(Recomendaciones nutricionales específicas)

## Calendario
(Mejor época de incubación, duración del ciclo, notas)

REGLAS:
1. Usa SOLO las aves del censo real — no inventes aves
2. Referencia siempre por anilla exacta
3. Justifica cada decisión con datos genéticos (score, peso, raza, COI)
4. Sé concreto y práctico — esto va a un ganadero real
5. Escribe en español coloquial profesional`;

  const userMessage = `CENSO DE AVES (${birds.length} total: ${machos.length} gallos, ${hembras.length} gallinas, ${razas.length} razas):

${JSON.stringify(birdsSummary, null, 2)}

${breeds_catalog ? `\nCATÁLOGO DE RAZAS DISPONIBLES:\n${JSON.stringify(breeds_catalog, null, 2)}` : ''}

${objectives ? `\nOBJETIVOS DEL CRIADOR:\n${JSON.stringify(objectives, null, 2)}` : ''}

Analiza mi cabaña completa y dame el plan de cría optimizado. Con ${machos.length} gallos y ${hembras.length} gallinas, ¿cuántos gallineros de cría debo montar? ¿Qué gallo con qué gallinas en cada uno? Justifica cada decisión con las métricas genéticas reales.`;

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

    return NextResponse.json({ recommendation: text });
  } catch (err: any) {
    console.error('AI recommend error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
