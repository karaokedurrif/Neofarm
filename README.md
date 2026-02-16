# NeoFarm Landing Page

Landing page multi-variante para NeoFarm.io con detección automática de dominio.

## Variantes

- **neofarm.io**: Landing general multi-especie
- **vacasdata.com**: Landing vertical vacuno
- **porcdata.com**: Landing vertical porcino

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Producción

```bash
# Build y run con Docker
docker compose up -d --build

# O con npm
npm run build
npm start
```

## Estructura

```
src/
├── app/
│   ├── page.tsx          # Landing principal
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Hero.tsx
│   ├── ModulesGrid.tsx
│   ├── FarmMatchSection.tsx
│   ├── Pricing.tsx
│   └── Footer.tsx
└── config/
    └── variants.ts       # Configuración de 3 variantes
```

## Variables de entorno

```env
NEXT_PUBLIC_APP_URL=https://app.neofarm.io
NEXT_PUBLIC_API_URL=https://api.neofarm.io
```

## Deploy

El contenedor se expone en puerto 3020 y debe estar conectado a la red de Cloudflare Tunnel.

En Cloudflare Tunnel, configurar:
- neofarm.io → http://neofarm-landing:3000
- www.neofarm.io → http://neofarm-landing:3000
- vacasdata.com → http://neofarm-landing:3000
- www.vacasdata.com → http://neofarm-landing:3000
- porcdata.com → http://neofarm-landing:3000
- www.porcdata.com → http://neofarm-landing:3000
