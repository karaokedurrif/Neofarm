"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Farm ──────────────────────────────────────────────
class FarmOut(BaseModel):
    id: int
    slug: str
    name: str
    is_demo: bool
    class Config:
        from_attributes = True


# ── Gallinero ─────────────────────────────────────────
class GallineroCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    zona: str = "Mixto"
    capacidad: int = 20
    m2: float = 25
    notas: Optional[str] = None


class GallineroUpdate(BaseModel):
    name: Optional[str] = None
    zona: Optional[str] = None
    capacidad: Optional[int] = None
    m2: Optional[float] = None
    aves_count: Optional[int] = None
    temp: Optional[float] = None
    humedad: Optional[float] = None
    estado: Optional[str] = None
    notas: Optional[str] = None


class GallineroOut(BaseModel):
    id: int
    name: str
    zona: str
    capacidad: int
    m2: float
    aves_count: int
    temp: Optional[float]
    humedad: Optional[float]
    estado: str
    notas: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Ave ───────────────────────────────────────────────
class AveCreate(BaseModel):
    anilla: str = Field(..., min_length=1, max_length=50)
    tipo: str
    raza: str
    color: Optional[str] = None
    sexo: str = Field(..., pattern=r'^[MH]$')
    fecha_nac: Optional[str] = None
    peso: float = 0
    estado: str = "Ponedora activa"
    gallinero: Optional[str] = None
    notas: Optional[str] = None
    foto: Optional[str] = None
    ai_vision_id: Optional[str] = None
    fecha_alta: Optional[str] = None


class AveUpdate(BaseModel):
    anilla: Optional[str] = None
    tipo: Optional[str] = None
    raza: Optional[str] = None
    color: Optional[str] = None
    sexo: Optional[str] = None
    fecha_nac: Optional[str] = None
    peso: Optional[float] = None
    estado: Optional[str] = None
    gallinero: Optional[str] = None
    notas: Optional[str] = None
    foto: Optional[str] = None
    ai_vision_id: Optional[str] = None


class AveOut(BaseModel):
    id: int
    anilla: str
    tipo: str
    raza: str
    color: Optional[str]
    sexo: str
    fecha_nac: Optional[str]
    peso: float
    estado: str
    gallinero: Optional[str]
    notas: Optional[str]
    foto: Optional[str]
    ai_vision_id: Optional[str]
    fecha_alta: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Lote (Production) ────────────────────────────────
class LoteCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=200)
    fase: str = "Incubación"
    animales: int = 1
    raza_cruce: Optional[str] = None
    fecha_inicio: Optional[str] = None
    gallinero: Optional[str] = None
    peso_medio: Optional[float] = None
    mortalidad: int = 0
    notas: Optional[str] = None


class LoteUpdate(BaseModel):
    nombre: Optional[str] = None
    fase: Optional[str] = None
    animales: Optional[int] = None
    raza_cruce: Optional[str] = None
    fecha_inicio: Optional[str] = None
    gallinero: Optional[str] = None
    peso_medio: Optional[float] = None
    mortalidad: Optional[int] = None
    notas: Optional[str] = None


class LoteOut(BaseModel):
    id: int
    nombre: str
    fase: str
    animales: int
    raza_cruce: Optional[str]
    fecha_inicio: Optional[str]
    gallinero: Optional[str]
    peso_medio: Optional[float]
    mortalidad: int
    notas: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Venta (ERP) ──────────────────────────────────────
class VentaCreate(BaseModel):
    concepto: str = Field(..., min_length=1, max_length=300)
    codigo: Optional[str] = None
    cliente: Optional[str] = None
    cantidad: int = 1
    precio_unit: float = 0
    total: float = 0
    fecha: Optional[str] = None
    estado: str = "Pendiente"
    notas: Optional[str] = None


class VentaUpdate(BaseModel):
    concepto: Optional[str] = None
    codigo: Optional[str] = None
    cliente: Optional[str] = None
    cantidad: Optional[int] = None
    precio_unit: Optional[float] = None
    total: Optional[float] = None
    fecha: Optional[str] = None
    estado: Optional[str] = None
    notas: Optional[str] = None


class VentaOut(BaseModel):
    id: int
    concepto: str
    codigo: Optional[str]
    cliente: Optional[str]
    cantidad: int
    precio_unit: float
    total: float
    fecha: Optional[str]
    estado: str
    notas: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Compra (ERP) ─────────────────────────────────────
class CompraCreate(BaseModel):
    concepto: str = Field(..., min_length=1, max_length=300)
    codigo: Optional[str] = None
    proveedor: Optional[str] = None
    cantidad: int = 1
    precio_unit: float = 0
    total: float = 0
    fecha: Optional[str] = None
    estado: str = "Pendiente"
    notas: Optional[str] = None


class CompraUpdate(BaseModel):
    concepto: Optional[str] = None
    codigo: Optional[str] = None
    proveedor: Optional[str] = None
    cantidad: Optional[int] = None
    precio_unit: Optional[float] = None
    total: Optional[float] = None
    fecha: Optional[str] = None
    estado: Optional[str] = None
    notas: Optional[str] = None


class CompraOut(BaseModel):
    id: int
    concepto: str
    codigo: Optional[str]
    proveedor: Optional[str]
    cantidad: int
    precio_unit: float
    total: float
    fecha: Optional[str]
    estado: str
    notas: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True
