import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for Spanish Catastro API.
 * Avoids CORS issues when calling from the browser.
 *
 * Uses two endpoints:
 *  - Consulta_CPMRC  → coordinates (xcen, ycen) + ldt
 *  - Consulta_DNPRC  → surface (sfc), province, municipality, use
 */
export async function GET(req: NextRequest) {
  const rc = req.nextUrl.searchParams.get('rc')?.trim() || '';

  if (!rc || rc.length < 14) {
    return NextResponse.json(
      { error: 'Referencia catastral inválida (mín. 14 caracteres)' },
      { status: 400 },
    );
  }

  // Use only the first 14 characters for the coordinate lookup
  const rc14 = rc.substring(0, 14);

  try {
    // 1) Get coordinates
    const coordUrl =
      `http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_CPMRC` +
      `?Provincia=&Municipio=&SRS=EPSG:4326&RC=${encodeURIComponent(rc14)}`;

    const coordRes = await fetch(coordUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { Accept: 'application/xml, text/xml' },
    });

    if (!coordRes.ok) {
      return NextResponse.json(
        { error: `Catastro coordenadas respondió ${coordRes.status}` },
        { status: 502 },
      );
    }

    const coordXml = await coordRes.text();

    // Check for error
    const errMatch = coordXml.match(/<des[^>]*>([^<]+)<\/des>/i);
    const cuerrMatch = coordXml.match(/<cuerr[^>]*>([^<]+)<\/cuerr>/i);
    const xcenMatch = coordXml.match(/<xcen[^>]*>([^<]+)<\/xcen>/i);
    const ycenMatch = coordXml.match(/<ycen[^>]*>([^<]+)<\/ycen>/i);

    // cuerr > 0 means error; also check xcen/ycen exist and are nonzero
    const hasError = cuerrMatch && parseInt(cuerrMatch[1]) > 0;
    if (hasError || !xcenMatch || !ycenMatch) {
      const errMsg = errMatch ? errMatch[1] : 'No se encontró la parcela';
      return NextResponse.json({ error: errMsg }, { status: 404 });
    }

    const lon = parseFloat(xcenMatch[1]);
    const lat = parseFloat(ycenMatch[1]);

    if (lat === 0 && lon === 0) {
      return NextResponse.json({ error: 'Referencia catastral no encontrada' }, { status: 404 });
    }
    const ldtMatch = coordXml.match(/<ldt[^>]*>([^<]+)<\/ldt>/i);
    const descripcion = ldtMatch ? ldtMatch[1] : '';

    // 2) Get surface + details (DNPRC)
    const dnpUrl =
      `http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC` +
      `?Provincia=&Municipio=&RC=${encodeURIComponent(rc)}`;

    let superficie_m2 = 0;
    let provincia = '';
    let municipio = '';
    let uso = '';

    try {
      const dnpRes = await fetch(dnpUrl, {
        signal: AbortSignal.timeout(10000),
        headers: { Accept: 'application/xml, text/xml' },
      });
      if (dnpRes.ok) {
        const dnpXml = await dnpRes.text();
        const sfcMatch = dnpXml.match(/<sfc[^>]*>([^<]+)<\/sfc>/i);
        const npMatch = dnpXml.match(/<np[^>]*>([^<]+)<\/np>/i);
        const nmMatch = dnpXml.match(/<nm[^>]*>([^<]+)<\/nm>/i);
        const lusoMatch = dnpXml.match(/<luso[^>]*>([^<]+)<\/luso>/i);
        if (sfcMatch) superficie_m2 = parseFloat(sfcMatch[1]);
        if (npMatch) provincia = npMatch[1];
        if (nmMatch) municipio = nmMatch[1];
        if (lusoMatch) uso = lusoMatch[1];
      }
    } catch {
      // DNP is optional — coordinates are enough
    }

    // WMS map tile URL
    const margin = 0.003;
    const wms =
      `http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx` +
      `?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=Catastro&SRS=EPSG:4326` +
      `&BBOX=${lon - margin},${lat - margin},${lon + margin},${lat + margin}` +
      `&WIDTH=500&HEIGHT=350&FORMAT=image/png`;

    return NextResponse.json({
      lat,
      lon,
      superficie_m2,
      descripcion,
      provincia,
      municipio,
      uso,
      referencia: rc,
      wms,
    });
  } catch (e: any) {
    console.error('Catastro proxy error:', e);
    return NextResponse.json(
      { error: e.message || 'Error al consultar catastro' },
      { status: 500 },
    );
  }
}
