from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="OvoSfera API", version="1.0.0")

# CORS
origins = os.getenv("CORS_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ovosfera-api"}

@app.get("/")
async def root():
    return {
        "service": "OvoSfera API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# TODO: Add endpoints for:
# - /wizard/config
# - /gallineros
# - /aves
# - /production
# - /genetics/recommendations
# - /health/protocols
# - /nutrition/formulation
# - /carbon/balance
