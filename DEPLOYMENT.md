# 🚀 Guía de Deployment — OvoSfera Hub

## Requisitos Previos

- **Docker** 24.0+ y **Docker Compose** 2.20+
- **Puerto 3003** disponible (web)
- **Puerto 8004** disponible (API)
- **Puerto 5436** disponible (PostgreSQL)
- **Puerto 1885** disponible (MQTT)
- **Cuenta Replicate** con API token activo

---

## 1. Configuración Inicial

### 1.1 Crear `.env.local`

```bash
cd /srv/docker/apps/ovosfera-hub
cp .env.local.example .env.local
nano .env.local
```

**⚠️ CRÍTICO**: Añadir tu token de Replicate:

```bash
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_API_URL=https://api.ovosfera.com
```

Para obtener el token:
1. Ir a https://replicate.com/account
2. Click en "API tokens"
3. Copiar tu token (empieza por `r8_`)

### 1.2 Hacer ejecutable el script de inicio

```bash
chmod +x start-web.sh
```

### 1.3 Verificar permisos

```bash
# Ajustar ownership si es necesario
docker run --rm -v /srv/docker/apps/ovosfera-hub:/app alpine chown -R 1000:1000 /app
```

---

## 2. Levantar Servicios

```bash
docker compose up -d
```

Esto iniciará:
- `ovosfera-db` (PostgreSQL 16 + PostGIS)
- `ovosfera-api` (FastAPI backend)
- `ovosfera-web` (Next.js frontend)
- `ovosfera-mqtt` (MQTT broker)

**Primera vez**: El contenedor `ovosfera-web` tardará ~30-60s en instalar dependencias con pnpm.

---

## 3. Verificación

### 3.1 Verificar contenedores

```bash
docker compose ps
```

Todos los servicios deben estar `Up` con `healthy` en health checks.

### 3.2 Verificar logs

```bash
# Web logs (esperar mensaje "ready started server on 0.0.0.0:3000")
docker compose logs -f web

# API logs (esperar "Application startup complete")
docker compose logs -f api
```

### 3.3 Health checks

```bash
# API health
curl http://localhost:8004/health
# Respuesta esperada: {"status":"ok","service":"ovosfera-api"}

# Web (esperar ~30s primera vez)
curl -I http://localhost:3003
# Respuesta esperada: HTTP/1.1 200 OK
```

### 3.4 Acceder a la aplicación

Abrir navegador en:
**http://localhost:3003/dashboard**

---

## 4. Acceso Remoto (Cloudflare Tunnel)

### 4.1 Configurar tunnels en Cloudflare Zero Trust

Dashboard → Access → Tunnels → [Tu tunnel] → Public Hostname

#### Añadir hostname para web:
- **Subdomain**: `hub`
- **Domain**: `ovosfera.com`
- **Service**: `http://ovosfera-web:3000`

#### Añadir hostname para API:
- **Subdomain**: `api`
- **Domain**: `ovosfera.com`
- **Service**: `http://ovosfera-api:8000`

### 4.2 Actualizar `.env.local`

```bash
NEXT_PUBLIC_API_URL=https://api.ovosfera.com
```

### 4.3 Restart web para aplicar cambios

```bash
docker compose restart web
```

### 4.4 Verificar acceso

- **Web**: https://hub.ovosfera.com/dashboard
- **API**: https://api.ovosfera.com/health

---

## 5. Maintenance

### 5.1 Ver logs en tiempo real

```bash
docker compose logs -f
docker compose logs -f web      # Solo frontend
docker compose logs -f api      # Solo API
```

### 5.2 Restart servicios

```bash
docker compose restart web
docker compose restart api
docker compose restart db
docker compose restart mqtt
```

### 5.3 Rebuild completo

```bash
docker compose down
docker compose up -d --build
```

### 5.4 Limpiar todo (⚠️ BORRA DATOS)

```bash
docker compose down -v
```

### 5.5 Backup base de datos

```bash
docker exec ovosfera-db pg_dump -U ovosfera_user ovosfera_db > backup_$(date +%Y%m%d).sql
```

### 5.6 Restore base de datos

```bash
cat backup_20240115.sql | docker exec -i ovosfera-db psql -U ovosfera_user ovosfera_db
```

---

## 6. Troubleshooting

### Problema: "Cannot find module 'next'"

**Causa**: Deps no instaladas en contenedor web.

**Solución**:
```bash
docker compose restart web
# Esperar 30-60s que instale con pnpm
docker compose logs -f web
```

### Problema: "Replicate API error 401"

**Causa**: Token inválido o no configurado.

**Solución**:
1. Verificar que `.env.local` existe y tiene `REPLICATE_API_TOKEN`
2. Verificar que el token es válido en https://replicate.com/account
3. Restart web: `docker compose restart web`

### Problema: "EADDRINUSE: address already in use :3003"

**Causa**: Puerto 3003 ocupado.

**Solución**:
```bash
# Identificar proceso
lsof -i :3003

# Matar proceso
kill -9 <PID>

# O cambiar puerto en docker-compose.yml
ports:
  - "3004:3000"  # Usar 3004 en lugar de 3003
```

### Problema: "Permission denied" al escribir archivos

**Causa**: Permisos incorrectos en directorio.

**Solución**:
```bash
docker run --rm -v /srv/docker/apps/ovosfera-hub:/app alpine chown -R 1000:1000 /app
```

### Problema: "Database connection failed"

**Causa**: PostgreSQL no iniciado o credenciales incorrectas.

**Solución**:
```bash
# Verificar estado
docker compose ps db

# Verificar logs
docker compose logs db

# Recrear contenedor
docker compose down db
docker compose up -d db
```

---

## 7. Seguridad — Checklist Pre-Producción

- [ ] `.env.local` **NO** está en Git (verificar `.gitignore`)
- [ ] `REPLICATE_API_TOKEN` solo en `.env.local` (NUNCA en código)
- [ ] Cambiar contraseñas de PostgreSQL en producción
- [ ] Firewall: solo puertos Cloudflare Tunnel abiertos
- [ ] HTTPS habilitado (Cloudflare Tunnel automático)
- [ ] Backup automático base de datos configurado
- [ ] Logs rotados (Docker logrotate)

---

## 8. Monitoreo

### 8.1 Docker stats

```bash
docker stats ovosfera-web ovosfera-api ovosfera-db ovosfera-mqtt
```

### 8.2 Disk usage

```bash
docker system df
```

### 8.3 Limpiar espacio

```bash
# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados (⚠️ CUIDADO)
docker volume prune
```

---

## 9. Desarrollo Local

Si quieres desarrollar sin Docker:

```bash
# Backend
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8004

# Frontend
cd apps/web
pnpm install
pnpm dev
```

Luego acceder a `http://localhost:3000` (Next.js dev server).

---

## 10. Actualizaciones

### 10.1 Pull cambios Git

```bash
cd /srv/docker/apps/ovosfera-hub
git pull origin main
```

### 10.2 Rebuild contenedores

```bash
docker compose down
docker compose up -d --build
```

### 10.3 Reinstalar deps frontend

```bash
docker exec -it ovosfera-web sh
pnpm install
exit
docker compose restart web
```

---

## 11. CI/CD (Próximamente)

Configurar GitHub Actions para deployment automático:

1. Push a `main` → tests automáticos
2. Tests OK → build images
3. Push a registry (GHCR)
4. SSH al servidor → pull + restart

---

## Soporte

Cualquier problema, revisar:
1. Logs: `docker compose logs -f`
2. Health checks: `curl http://localhost:8004/health`
3. Disk space: `df -h`
4. Documentación: README.md

**Autor**: David (@durrif)  
**Versión**: 1.0.0  
**Última actualización**: Enero 2024
