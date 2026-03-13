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

    const hasError = cuerrMatch && parseInt(cuerrMatch[1]) > 0;
    let lon = 0, lat = 0;
    let descripcion = '';

    if (!hasError && xcenMatch && ycenMatch) {
      lon = parseFloat(xcenMatch[1]);
      lat = parseFloat(ycenMatch[1]);
      const ldtMatch = coordXml.match(/<ldt[^>]*>([^<]+)<\/ldt>/i);
      descripcion = ldtMatch ? ldtMatch[1] : '';
    }

    // Fallback: if CPMRC failed, try INSPIRE WFS to find the parcel by reference
    if ((lat === 0 && lon === 0) || hasError) {
      try {
        // INSPIRE WFS GetFeature by ResourceID
        const inspireRefUrl =
          `https://ovc.catastro.meh.es/INSPIRE/wfsCP.aspx?service=WFS&version=2.0.0` +
          `&request=GetFeature&typenames=cp:CadastralParcel&srsName=EPSG:4326` +
          `&RESOURCEID=ES.SDGC.CP.${encodeURIComponent(rc14)}`;
        const irRes = await fetch(inspireRefUrl, {
          signal: AbortSignal.timeout(12000),
          headers: { Accept: 'application/xml, text/xml' },
        });
        if (irRes.ok) {
          const irXml = await irRes.text();
          // Find our exact parcel in the response
          const memberRegex = /<member>([\s\S]*?)<\/member>/gi;
          let m2;
          while ((m2 = memberRegex.exec(irXml)) !== null) {
            const block = m2[1];
            const refM = block.match(/nationalCadastralReference>([^<]+)/);
            if (refM && refM[1].toLowerCase() === rc14.toLowerCase()) {
              const posM = block.match(/referencePoint[\s\S]*?<gml:pos>([^<]+)/);
              if (posM) {
                const [pLat, pLon] = posM[1].split(' ').map(Number);
                if (pLat && pLon) { lat = pLat; lon = pLon; }
              }
              const areaM = block.match(/areaValue[^>]*>(\d+)/);
              if (areaM) descripcion = `Parcela ${rc14} (${areaM[1]} m² vía INSPIRE)`;
              break;
            }
          }
        }
      } catch { /* INSPIRE fallback is optional */ }
    }

    // Fallback 2: accept explicit lat/lon query params when reference can't be resolved
    if (lat === 0 && lon === 0) {
      const qLat = parseFloat(req.nextUrl.searchParams.get('lat') || '');
      const qLon = parseFloat(req.nextUrl.searchParams.get('lon') || '');
      if (qLat && qLon) {
        lat = qLat;
        lon = qLon;
        descripcion = descripcion || `Coordenadas manuales para ${rc}`;
      }
    }

    if (lat === 0 && lon === 0) {
      const errMsg = errMatch ? errMatch[1] : 'No se encontró la parcela. Puedes añadir coordenadas manuales (?lat=...&lon=...).';
      return NextResponse.json({ error: errMsg }, { status: 404 });
    }

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

    // 3) Get elevation / altitude from Open-Meteo (free, no key)
    let altitud: number | null = null;
    try {
      const elevUrl = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
      const elevRes = await fetch(elevUrl, { signal: AbortSignal.timeout(8000) });
      if (elevRes.ok) {
        const elevJson = await elevRes.json();
        if (elevJson.elevation && Array.isArray(elevJson.elevation) && elevJson.elevation.length > 0) {
          altitud = elevJson.elevation[0];
        }
      }
    } catch {
      // elevation is optional
    }

    // 4) If surface is still 0, try INSPIRE WFS spatial query (authoritative parcel geometry + area)
    let parcelBbox: [number, number, number, number] | null = null;

    if (superficie_m2 === 0 && lat !== 0 && lon !== 0) {
      try {
        const bboxMargin = 0.002; // ~200m around center
        const wfsBbox = `${lat - bboxMargin},${lon - bboxMargin},${lat + bboxMargin},${lon + bboxMargin},EPSG:4326`;
        const inspireUrl =
          `https://ovc.catastro.meh.es/INSPIRE/wfsCP.aspx?service=WFS&version=2.0.0` +
          `&request=GetFeature&typenames=cp:CadastralParcel&bbox=${wfsBbox}&srsName=EPSG:4326`;

        const inspireRes = await fetch(inspireUrl, {
          signal: AbortSignal.timeout(12000),
          headers: { Accept: 'application/xml, text/xml' },
        });
        if (inspireRes.ok) {
          const inspireXml = await inspireRes.text();
          // Extract all parcels with their ref, area, and reference point
          const parcels: { ref: string; area: number; lat: number; lon: number }[] = [];
          const memberRegex = /<member>([\s\S]*?)<\/member>/gi;
          let m;
          while ((m = memberRegex.exec(inspireXml)) !== null) {
            const block = m[1];
            const refM = block.match(/nationalCadastralReference>([^<]+)/);
            const areaM = block.match(/areaValue[^>]*>(\d+)/);
            const posM = block.match(/referencePoint[\s\S]*?<gml:pos>([^<]+)/);
            if (refM && areaM) {
              const coords = posM?.[1].split(' ') || [];
              parcels.push({
                ref: refM[1],
                area: parseInt(areaM[1]),
                lat: parseFloat(coords[0]) || 0,
                lon: parseFloat(coords[1]) || 0,
              });
            }
          }

          if (parcels.length > 0) {
            // 1) Try exact match on first 14 chars of input reference
            const rc14Lower = rc14.toLowerCase();
            let matched = parcels.find(p => p.ref.toLowerCase() === rc14Lower);
            // 2) Fallback: closest parcel to the coordinate center
            if (!matched) {
              matched = parcels.reduce((closest, p) => {
                const dist = Math.hypot(p.lat - lat, p.lon - lon);
                const closestDist = Math.hypot(closest.lat - lat, closest.lon - lon);
                return dist < closestDist ? p : closest;
              }, parcels[0]);
            }
            if (matched && matched.area > 0) {
              superficie_m2 = matched.area;
            }
          }

          // Extract parcel polygon bounding box for Sentinel tight view
          const posListMatch = inspireXml.match(/posList[^>]*>([^<]+)/);
          if (posListMatch) {
            const coords = posListMatch[1].trim().split(/\s+/).map(Number);
            let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
            for (let i = 0; i < coords.length - 1; i += 2) {
              const pLat = coords[i], pLon = coords[i + 1];
              if (pLat < minLat) minLat = pLat;
              if (pLat > maxLat) maxLat = pLat;
              if (pLon < minLon) minLon = pLon;
              if (pLon > maxLon) maxLon = pLon;
            }
            // Add small padding (10%)
            const latPad = (maxLat - minLat) * 0.1;
            const lonPad = (maxLon - minLon) * 0.1;
            parcelBbox = [minLon - lonPad, minLat - latPad, maxLon + lonPad, maxLat + latPad];
          }
        }
      } catch {
        // INSPIRE is optional
      }
    }

    // Climate zone estimation based on altitude + latitude
    let climaZona = 'Mediterráneo';
    if (altitud !== null) {
      if (altitud > 1500) climaZona = 'Alta montaña';
      else if (altitud > 800) climaZona = 'Montaña media';
      else if (altitud > 400) climaZona = 'Meseta / Continental';
      else if (lat > 43) climaZona = 'Atlántico';
      else climaZona = 'Mediterráneo';
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
      altitud,
      climaZona,
      descripcion,
      provincia,
      municipio,
      uso,
      referencia: rc,
      wms,
      parcelBbox,
    });
  } catch (e: any) {
    console.error('Catastro proxy error:', e);
    return NextResponse.json(
      { error: e.message || 'Error al consultar catastro' },
      { status: 500 },
    );
  }
}
