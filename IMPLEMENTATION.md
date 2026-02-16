# 🚀 NeoFarm Landing Page - Documentación de Implementación

## ✅ Completado - FASE 1 Landing Page

### Estado actual
Landing page completamente funcional en **http://localhost:3020**

### Estructura creada
```
/srv/docker/apps/neofarm-landing/
├── src/
│   ├── app/
│   │   ├── page.tsx          ✅ Landing principal con detección de dominio
│   │   ├── layout.tsx        ✅ Layout base
│   │   └── globals.css       ✅ Estilos globales + Tailwind
│   ├── components/
│   │   ├── Hero.tsx          ✅ Hero multi-variante
│   │   ├── ModulesGrid.tsx   ✅ Grid de módulos adaptativos
│   │   ├── FarmMatchSection.tsx ✅ Sección destacada con mockup
│   │   ├── Pricing.tsx       ✅ 3 tiers (49€/99€/199€)
│   │   └── Footer.tsx        ✅ Footer con enlaces
│   └── config/
│       └── variants.ts       ✅ Sistema de 3 variantes
├── public/
│   ├── logo-neofarm.svg      ✅ Logo SVG
│   └── README.md             ✅ Placeholder para imágenes hero
├── Dockerfile                ✅ Multi-stage build optimizado
├── docker-compose.yml        ✅ Puerto 3020
└── README.md                 ✅ Documentación
```

### Variantes implementadas

#### 1. General (neofarm.io)
- **Headline**: "Transforma tu granja en un gemelo digital"
- **Color primario**: Teal (#0F766E)
- **Módulos**: 4 tipos de ganadería (vacuno, porcino, avícola, ovino)
- **CTA**: Comenzar setup (3 min)

#### 2. Bovine (vacasdata.com)
- **Headline**: "Tu rebaño conectado en tiempo real"
- **Color primario**: Forest green (#1B4332)
- **Módulos**: GPS LoRa, Genética EPDs, Carbono MRV, Trazabilidad
- **CTA**: Ver demo vacuno → https://app.neofarm.io/demo/bovine

#### 3. Porcine (porcdata.com)
- **Headline**: "Infraestructura inteligente para naves ganaderas"
- **Color primario**: Terracotta (#7C2D12)
- **Módulos**: IoT Barn, IA Vision, SIGE Digital, SmartPurín
- **CTA**: Ver demo porcino → https://app.neofarm.io/demo/porcine

### Características técnicas
- ✅ Next.js 14 (App Router)
- ✅ TypeScript + strict mode
- ✅ Tailwind CSS con theme personalizado
- ✅ Detección automática de dominio (cliente + servidor)
- ✅ Responsive design (mobile-first)
- ✅ Docker multi-stage build (optimizado)
- ✅ 9 secciones completas:
  1. Hero
  2. Social proof
  3. Problema → Solución
  4. Módulos (grid adaptativo)
  5. FarmMatch™ (destacado con mockup móvil)
  6. Demo (selector o embed)
  7. Precios (3 tiers)
  8. FAQ (5 preguntas)
  9. CTA final + Footer

### Sección FarmMatch™
Mockup de interfaz tipo Tinder con:
- Card de animal con foto placeholder
- Puntuación de compatibilidad (92%)
- Métricas genéticas (Heterosis, Consanguinidad, EPD)
- 3 botones swipe (✕, ★, ♥)
- Diseño de teléfono realista

### Despliegue
```bash
# Construcción
cd /srv/docker/apps/neofarm-landing
docker compose build

# Inicio
docker compose up -d

# Verificación
curl http://localhost:3020
docker logs neofarm-landing
```

**Puerto**: 3020  
**Red**: vacasdata-hub-v2_vacasdata-v2-network (compartida con API/Hub)  
**Estado**: ✅ RUNNING

### Próximos pasos (Cloudflare Tunnel)

#### Configuración en Cloudflare Tunnel:
```yaml
# YA CONFIGURADOS según prompt:
- neofarm.io → http://neofarm-landing:3000
- www.neofarm.io → http://neofarm-landing:3000

# POR CONFIGURAR:
- vacasdata.com → http://neofarm-landing:3000
- www.vacasdata.com → http://neofarm-landing:3000
- porcdata.com → http://neofarm-landing:3000
- www.porcdata.com → http://neofarm-landing:3000
```

### Assets pendientes
Las siguientes ilustraciones son placeholders. Necesitan crearse:
- [ ] `hero-general.webp` - Ilustración isométrica multi-especie
- [ ] `hero-bovine.webp` - Vacas en campo con tecnología
- [ ] `hero-porcine.webp` - Nave porcina inteligente

Actualmente se muestran con emoji + texto descriptivo.

---

## 🎯 FASE 2: Rebranding Hub (EN PROGRESO)

### Objetivos
1. Cambiar todos los "VacasData" → "NeoFarm"
2. Actualizar logo y colores
3. Configurar variables de entorno
4. Crear selector /demo (bovino/porcino)

### Archivos a modificar
```bash
cd /srv/docker/apps/vacasdata-hub-v2/apps/web

# Buscar referencias a reemplazar
grep -rn "VacasData\|PorciData\|Vacas Data" src/ --include="*.tsx" --include="*.ts"
```

### Branding nuevo
```typescript
export const BRANDING = {
  name: "NeoFarm",
  logo: "/logo-neofarm.svg",
  colors: {
    primary: "#0F766E",       // teal-700
    primaryLight: "#14B8A6",  // teal-500
    secondary: "#10B981",     // emerald-500
    accent: "#F59E0B",        // amber-500
    surface: "#FAFAF9",
    dark: "#0C0C0C",
  },
};
```

---

**Commit**: d4a9405 (21 files, 1305 insertions)  
**Autor**: GitHub Copilot (Claude Sonnet 4.5)  
**Fecha**: 16 Febrero 2026  
