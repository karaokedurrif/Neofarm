import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { galloRaza, gallinaRaza, objetivo } = await req.json();
    const token = process.env.REPLICATE_API_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: 'Token Replicate no configurado' }, { status: 500 });
    }

    const prompt = objetivo === 'capón'
      ? `Professional poultry photography, single ${galloRaza} x ${gallinaRaza} crossbred capon chicken in Spanish free-range farm, golden afternoon light. Hybrid plumage blending characteristics, large well-fed body. National Geographic style, side profile, photorealistic. No text, no watermarks, no humans.`
      : `Professional poultry photography, single ${galloRaza} x ${gallinaRaza} crossbred hen in Spanish free-range farm, natural light. Hybrid plumage, walking on grass. National Geographic style, photorealistic. No text, no watermarks.`;

    // Crear predicción
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          prompt,
          negative_prompt: 'cartoon, illustration, drawing, multiple animals, humans, text, watermark, deformed, cage, intensive farming',
          width: 768,
          height: 512,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        },
      }),
    });

    if (!createRes.ok) {
      return NextResponse.json({ error: 'Error creando predicción' }, { status: 500 });
    }

    let result = await createRes.json();

    // Polling (máx 60s, cada 2s)
    for (let i = 0; i < 30; i++) {
      if (result.status === 'succeeded') break;
      if (result.status === 'failed' || result.status === 'canceled') {
        return NextResponse.json({ error: 'Predicción fallida: ' + (result.error || 'Unknown') }, { status: 500 });
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      result = await pollRes.json();
    }

    if (result.status !== 'succeeded') {
      return NextResponse.json({ error: 'Timeout generando imagen' }, { status: 504 });
    }

    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    return NextResponse.json({
      success: true,
      imageUrl,
      galloRaza,
      gallinaRaza,
      objetivo,
    });
  } catch (error: any) {
    console.error('Error en simulate-bird:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
