import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Breeding Recommender — calls Claude API with full flock data
 * and genetic metrics to produce a structured breeding plan.
 *
 * POST body: { birds, weights, traits, breeds_catalog, objectives }
 * Returns: structured JSON plan from Claude
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

  // Build the data summary for Claude
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

INSTRUCCIONES:
1. Analiza el censo completo de aves con sus métricas genéticas
2. Recomienda cuántos gallineros de cría (líneas de reproducción) montar
3. Para cada gallinero: 1 gallo + N gallinas (4-6 según el caso)
4. Justifica cada asignación basándose en: complementariedad de rasgos, evitación de consanguinidad (COI), selección score, raza/línea
5. Indica qué rasgos prioritarios fijar en cada línea
6. Da un roadmap F1→F3 de cómo progresar las líneas
7. IMPORTANTE: usa SOLO las aves que hay en el censo, no inventes aves

RESPONDE SIEMPRE EN JSON con esta estructura exacta:
{
  "resumen_ejecutivo": "texto resumen del plan",
  "num_gallineros_cria": N,
  "gallineros": [
    {
      "id": "L1",
      "nombre": "Línea Sabor",
      "objetivo": "descripción del objetivo de esta línea",
      "gallo": { "anilla": "XXX", "raza": "...", "justificacion": "..." },
      "gallinas": [
        { "anilla": "XXX", "raza": "...", "justificacion": "..." }
      ],
      "ratio": "1:N",
      "rasgos_prioritarios": ["rasgo1", "rasgo2"],
      "f1_esperado": "descripción de la F1 esperada",
      "riesgos": ["riesgo1"]
    }
  ],
  "gallos_sin_asignar": [
    { "anilla": "XXX", "rol": "Reserva / Rotación / Descarte", "motivo": "..." }
  ],
  "plan_consanguinidad": {
    "coi_medio_actual": 0.0,
    "estrategia": "texto",
    "rotaciones_previstas": "texto"
  },
  "roadmap": [
    { "generacion": "F1", "cruces": "...", "seleccion": "...", "objetivo": "..." },
    { "generacion": "F2", "cruces": "...", "seleccion": "...", "objetivo": "..." },
    { "generacion": "F3", "cruces": "...", "seleccion": "...", "objetivo": "..." }
  ],
  "nutricion_reproductores": "recomendaciones nutricionales",
  "calendario": {
    "mejor_epoca_incubacion": "...",
    "duracion_ciclo": "...",
    "notas": "..."
  }
}`;

  const userMessage = `CENSO DE AVES (${birds.length} total: ${machos.length} machos, ${hembras.length} hembras, ${razas.length} razas):

${JSON.stringify(birdsSummary, null, 2)}

${breeds_catalog ? `\nCATÁLOGO DE RAZAS DISPONIBLES:\n${JSON.stringify(breeds_catalog, null, 2)}` : ''}

${objectives ? `\nOBJETIVOS DEL CRIADOR:\n${JSON.stringify(objectives, null, 2)}` : ''}

Analiza mi cabaña completa y dame el plan de cría optimizado. Con ${machos.length} gallos y ${hembras.length} gallinas, ¿cuántos gallineros de cría debo montar? ¿Qué gallo con qué gallinas en cada uno? Basa tu respuesta en las métricas genéticas reales de cada ave.`;

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
        max_tokens: 4096,
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

    // Try to parse JSON from response
    let plan: any;
    try {
      // Find JSON block in response (may be wrapped in markdown code fence)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[1]);
      } else {
        plan = JSON.parse(text);
      }
    } catch {
      // Return raw text if JSON parsing fails
      plan = { raw_response: text, parse_error: true };
    }

    return NextResponse.json(plan);
  } catch (err: any) {
    console.error('AI recommend error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
