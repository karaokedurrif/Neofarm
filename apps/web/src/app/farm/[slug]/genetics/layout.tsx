'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { setActiveFarm, loadProgram, saveProgram } from '@/lib/genetics/store';
import type { Bird as BirdType } from '@/lib/genetics/types';
import { Dna, Loader } from 'lucide-react';

/** Map an API Ave row to a genetics Bird object */
function apiAveToBird(ave: any): BirdType {
  return {
    id: `api-${ave.id}`,
    anilla: ave.anilla || `AVE-${ave.id}`,
    nombre: ave.anilla || '',
    sexo: ave.sexo === 'H' ? 'F' : ave.sexo === 'M' ? 'M' : 'unknown',
    raza: ave.raza || 'Desconocida',
    linea: 'A',
    generacion: 'F0',
    padreId: null,
    madreId: null,
    origen: 'fundador',
    fechaNacimiento: ave.fecha_nac || new Date().toISOString().slice(0, 10),
    colorPlumaje: ave.color || '',
    pesoActual: ave.peso || 0,
    autoSexing: false,
    cincoDedos: false,
    patasEmplumadas: false,
    conformacionPecho: 3,
    conformacionMuslo: 3,
    docilidad: 3,
    lote: '',
    instalacion: ave.gallinero?.toString() || '',
    estadoProductivo: 'activo',
    estadoSeleccion: 'pendiente',
    estadoComercial: 'no_asignado',
    destinoRecomendado: 'reproductor',
    notas: ave.notas || '',
    fotos: ave.foto ? [ave.foto] : [],
  };
}

export default function TenantGeneticsLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const slug = params?.slug as string;
  const [ready, setReady] = useState(false);

  // Set active farm synchronously so any child render reads the right key
  setActiveFarm(slug);

  useEffect(() => {
    setActiveFarm(slug);
    let cancelled = false;

    async function bootstrap() {
      const prog = loadProgram();
      // If the tenant program has no birds, auto-import from the API census
      if (prog.birds.length === 0) {
        try {
          const res = await fetch(`/api/ovosfera/farms/${encodeURIComponent(slug)}/aves`);
          if (res.ok) {
            const aves: any[] = await res.json();
            if (!cancelled && aves.length > 0) {
              const existingAnillas = new Set(prog.birds.map(b => b.anilla));
              for (const ave of aves) {
                const bird = apiAveToBird(ave);
                if (!existingAnillas.has(bird.anilla)) {
                  prog.birds.push(bird);
                  existingAnillas.add(bird.anilla);
                }
              }
              saveProgram(prog);
            }
          }
        } catch {
          // API not available — proceed with empty program
        }
      }
      if (!cancelled) setReady(true);
    }

    bootstrap();
    return () => { cancelled = true; setActiveFarm(null); };
  }, [slug]);

  if (!ready) {
    return (
      <div className="nf-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 10 }}>
        <Dna size={20} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
        <span style={{ fontSize: 13, color: 'var(--neutral-500)' }}>Cargando genética de la explotación…</span>
      </div>
    );
  }

  return <>{children}</>;
}
