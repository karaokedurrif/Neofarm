from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from backend.routers import health, auth, tenants, bodegas, wines, sensors, analytics

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BodegaData Hub - Gestión Integral de Bodegas",
    version="1.0.0",
    description="API para gestión integral de bodegas, viñedos y producción vitivinícola"
)

# CORS
cors_origins = os.getenv("CORS_ORIGINS", "https://hub.bodegadata.com").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(tenants.router, prefix="/api/tenants", tags=["Tenants"])
app.include_router(bodegas.router, prefix="/api/bodegas", tags=["Bodegas"])
app.include_router(wines.router, prefix="/api/wines", tags=["Wines"])
app.include_router(sensors.router, prefix="/api/sensors", tags=["Sensors"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.on_event("startup")
async def startup():
    logger.info("🍷 BodegaData Hub API v1.0.0 starting...")


@app.on_event("shutdown")
async def shutdown():
    logger.info("BodegaData Hub API shutting down...")
