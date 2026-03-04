# 🥚 OvoSfera Hub — Avicultura Inteligente

Hub de gestión avícola para cría de capones y gallinas en sistema extensivo/ecológico.

## 🚀 Quick Start

### 1. Clonar repositorio
```bash
cd /srv/docker/apps
git clone <tu-repo> ovosfera-hub
cd ovosfera-hub
```

### 2. Configurar entorno
```bash
# Copiar ejemplo de .env.local
cp .env.local.example .env.local

# ⚠️ IMPORTANTE: Editar .env.local y añadir tu REPLICATE_API_TOKEN
nano .env.local
```

```bash
# ovosfera-hub/.env.local
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_API_URL=https://api.ovosfera.com
```

### 3. Hacer ejecutable el script de inicio
```bash
chmod +x start-web.sh
```

### 4. Crear configuración MQTT
```bash
mkdir -p mqtt/config
```

### 5. Levantar servicios
```bash
docker compose up -d
```

Esto iniciará:
- **ovosfera-db** (PostgreSQL + PostGIS) en puerto 5436
- **ovosfera-api** (FastAPI) en puerto 8004
- **ovosfera-web** (Next.js) en puerto 3003
- **ovosfera-mqtt** (Mosquitto) en puertos 1885/9003

### 6. Verificar
```bash
# API health check
curl http://localhost:8004/health

# Web (esperar ~30s primera vez, instalando deps)
curl http://localhost:3003
```

Acceder a: **http://localhost:3003/dashboard**

## 🎨 Stack Tecnológico

### Backend
- **FastAPI** 0.109.0 + Uvicorn
- **PostgreSQL** 16 + PostGIS 3.4
- **SQLAlchemy** 2.0 + GeoAlchemy2

### Frontend
- **Next.js** 14.1.0 (App Router)
- **React** 18.2.0
- **TypeScript** 5.3.3
- **Lucide React** (iconos)

### AI/ML
- **Replicate API** (SDXL para simulador genético)

### IoT
- **MQTT** (Eclipse Mosquitto 2.0)

### Design System
- **NeoFarm OS v2** — Paleta avícola dorada (#B07D2B)

## 📁 Estructura Proyecto

```
ovosfera-hub/
├── apps/
│   ├── api/                 # FastAPI backend
│   │   ├── main.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── web/                 # Next.js frontend
│       ├── src/
│       │   ├── app/         # Páginas (App Router)
│       │   ├── components/  # Componentes React
│       │   ├── lib/         # Utils
│       │   └── hooks/       # Custom hooks
│       ├── package.json
│       └── tsconfig.json
├── mqtt/
│   └── config/
├── docker-compose.yml
├── pnpm-workspace.yaml
├── start-web.sh
├── .env.local               # ⚠️ NO SUBIR A GIT
└── .gitignore
```

## 🗺️ Páginas Implementadas

### ✅ Fase 1 — Core
- `/dashboard` — Dashboard con KPIs y Digital Twin de gallineros
- `/gallineros` — Lista de gallineros con indicadores IoT
- `/aves` — Inventario completo de aves
- `/production` — Producción diaria de huevos

### ✅ Fase 2 — Genética IA (LA JOYA)
- `/genetics` — Recomendador de cruces basado en tus ejemplares
- `/simulator` — **Simulador de fotos con Replicate** (genera imagen IA del cruce F1)

### ✅ Fase 3 — Gestión
- `/health` — Sanidad: protocolos de vacunación y enfermedades
- `/nutrition` — Formulación de pienso ecológico
- `/calendar` — Calendario de producción (capones + ponedoras)
- `/legislation` — Legislación española y bienestar animal

### ✅ Fase 4 — Sostenibilidad + Sistema
- `/carbon` — Huella de carbono avícola
- `/devices` — Dispositivos IoT conectados
- `/settings` — Configuración de la granja

### 🚧 Pendiente
- `/wizard` — Setup Wizard (6 pasos)
- `/traceability` — Trazabilidad lote → cliente
- `/erp` — Mini ERP

## 🔐 Seguridad — IMPORTANTE

### NUNCA subir `.env.local` a Git
El archivo `.env.local` contiene el token de Replicate y otras credenciales. **NUNCA** hacer commit de este archivo.

Verificar que `.gitignore` incluye:
```
.env.local
.env*.local
```

### Token Replicate
El token de Replicate **SOLO** debe estar en:
1. `.env.local` (desarrollo)
2. Variables de entorno Docker (producción)

**NUNCA** hardcodear el token en el código.

## 🌐 Cloudflare Tunnel (Producción)

Añadir en dashboard Cloudflare Zero Trust:

| Hostname | Service |
|---|---|
| `hub.ovosfera.com` | `http://ovosfera-web:3000` |
| `api.ovosfera.com` | `http://ovosfera-api:8000` |

## 🎯 Datos Demo

El sistema viene con datos demo de una granja real pequeña en Castilla y León:
- **38 aves** (18 gallinas, 2 gallos, 12 capones, 6 pollitos)
- **4 gallineros** (Principal, Capones, Cría, Parque exterior)
- **2 sensores IoT** (Temp/Humedad)
- **Producción**: ~4 huevos/día, tasa postura 22%

## 🧬 Simulador de Cruces con IA

La **joya del proyecto** es el simulador genético con Replicate:

1. Ir a `/simulator`
2. Seleccionar raza padre (gallo) y madre (gallina)
3. Elegir objetivo (Capón / Ponedora)
4. Click en "Simular Cruce F1"
5. Esperar 15-30s mientras Replicate genera la imagen fotorealista

**Tecnología**: Stable Diffusion XL (SDXL) via Replicate API

## 📊 Arquitectura

```
┌─────────────────────────────────────────────────┐
│              Cloudflare Tunnel                  │
│  hub.ovosfera.com    api.ovosfera.com          │
└──────────┬────────────────────┬─────────────────┘
           │                    │
           ▼                    ▼
    ┌────────────┐      ┌────────────┐
    │ ovosfera-  │      │ ovosfera-  │
    │    web     │─────▶│    api     │
    │ (Next.js)  │      │ (FastAPI)  │
    │ :3000      │      │ :8000      │
    └──────┬─────┘      └──────┬─────┘
           │                   │
           │          ┌────────┴─────────┐
           │          │                  │
           │          ▼                  ▼
           │   ┌────────────┐    ┌────────────┐
           │   │ ovosfera-  │    │ ovosfera-  │
           └──▶│    mqtt    │    │     db     │
               │(Mosquitto) │    │(PostgreSQL)│
               │ :1883      │    │ :5432      │
               └────────────┘    └────────────┘
```

## 🛠️ Comandos Útiles

```bash
# Ver logs
docker compose logs -f web
docker compose logs -f api

# Restart servicio
docker compose restart web

# Rebuild completo
docker compose down
docker compose up -d --build

# Acceder a shell del contenedor
docker exec -it ovosfera-web sh
docker exec -it ovosfera-api bash

# Limpiar volúmenes (⚠️ BORRA DATOS)
docker compose down -v
```

## 🐛 Troubleshooting

### "Permission denied" al crear archivos
```bash
# Ajustar permisos
docker run --rm -v /srv/docker/apps/ovosfera-hub:/app alpine chown -R 1000:1000 /app
```

### "Cannot find module 'next'"
```bash
# Reinstalar deps
docker compose restart web
# Esperar ~30s que instale pnpm + deps
```

### "Replicate API error"
Verificar que `.env.local` tiene `REPLICATE_API_TOKEN` correcto.

## 📝 Notas Técnicas

### NeoFarm OS Design System
- **Paleta**: Dorado cálido (#B07D2B primary-500)
- **Neutrals**: Arena/paja (warm gray)
- **Todas las clases CSS**: Prefijo `nf-*`
- **Sidebar**: 220px fijo, color neutral-800
- **StatusBar**: 48px altura, KPIs en tiempo real

### Datos reales vs demo
El sistema está preparado para datos reales de granjas pequeñas (40-80 aves) en extensivo/ecológico, NO para granjas industriales de 48,000 aves.

### Razas disponibles
Castellana Negra, Prat Leonada, Plymouth Rock, Sussex, Mos (Galicia), Empordanesa, Rhode Island Red, Wyandotte, Brahma, Marans.

## 📄 Licencia

Proyecto personal — No distribuir sin permiso.

## 👨‍💻 Autor

David — @durrif
