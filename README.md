# BodegaData Hub

Plataforma IoT modular para gestión integral de bodegas y producción vitivinícola.

## Arquitectura

- **API**: FastAPI (Python) - `api.bodegadata.com`
- **Web**: Next.js 14 + TailwindCSS - `hub.bodegadata.com`
- **DB**: PostgreSQL 16 + PostGIS
- **MQTT**: Eclipse Mosquitto 2.0
- **Monorepo**: pnpm + Turborepo

## Verticales del repo VacasAPP

| Vertical | Web | API |
|----------|-----|-----|
| VacasData Hub | hub.vacasdata.com | api-v2.vacasdata.com |
| OvoSfera Hub | hub.ovosfera.com | api.ovosfera.com |
| **BodegaData Hub** | **hub.bodegadata.com** | **api.bodegadata.com** |

## Desarrollo

```bash
docker compose up -d
```

## Puertos

| Servicio | Puerto Host | Puerto Container |
|----------|------------|-----------------|
| PostgreSQL | 5437 | 5432 |
| API | 8005 | 8000 |
| Web | 3004 | 3000 |
| MQTT | 1887 | 1883 |
| MQTT WS | 9005 | 9001 |
