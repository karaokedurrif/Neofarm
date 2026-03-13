"""SQLAlchemy models for OvoSfera — tenant-aware, multi-farm."""

from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, Boolean,
    ForeignKey, Index, func,
)
from sqlalchemy.orm import relationship
from database import Base


class Farm(Base):
    """A tenant farm."""
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    gallineros = relationship("Gallinero", back_populates="farm", cascade="all, delete-orphan")
    aves = relationship("Ave", back_populates="farm", cascade="all, delete-orphan")
    lotes = relationship("Lote", back_populates="farm", cascade="all, delete-orphan")
    ventas = relationship("Venta", back_populates="farm", cascade="all, delete-orphan")
    compras = relationship("Compra", back_populates="farm", cascade="all, delete-orphan")


class Gallinero(Base):
    """A coop / area within a farm."""
    __tablename__ = "gallineros"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    zona = Column(String(50), nullable=False, default="Mixto")
    capacidad = Column(Integer, default=20)
    m2 = Column(Float, default=25)
    aves_count = Column(Integer, default=0)
    temp = Column(Float, nullable=True)
    humedad = Column(Float, nullable=True)
    estado = Column(String(20), default="ok")
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    farm = relationship("Farm", back_populates="gallineros")

    __table_args__ = (Index("ix_gallineros_farm", "farm_id"),)


class Ave(Base):
    """A bird in the census."""
    __tablename__ = "aves"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    anilla = Column(String(50), nullable=False)
    tipo = Column(String(30), nullable=False)
    raza = Column(String(100), nullable=False)
    color = Column(String(100), nullable=True)
    sexo = Column(String(1), nullable=False)  # 'M' or 'H'
    fecha_nac = Column(String(10), nullable=True)  # ISO date
    peso = Column(Float, default=0)
    estado = Column(String(50), nullable=False, default="Ponedora activa")
    gallinero = Column(String(200), nullable=True)
    notas = Column(Text, nullable=True)
    foto = Column(Text, nullable=True)  # base64 or URL
    ai_vision_id = Column(String(100), nullable=True)
    fecha_alta = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    farm = relationship("Farm", back_populates="aves")

    __table_args__ = (
        Index("ix_aves_farm", "farm_id"),
        Index("ix_aves_anilla", "farm_id", "anilla", unique=True),
    )


class Lote(Base):
    """A production lot (batch) in the Kanban."""
    __tablename__ = "lotes"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String(200), nullable=False)
    fase = Column(String(50), nullable=False, default="Incubación")
    animales = Column(Integer, default=1)
    raza_cruce = Column(String(200), nullable=True)
    fecha_inicio = Column(String(10), nullable=True)
    gallinero = Column(String(200), nullable=True)
    peso_medio = Column(Float, nullable=True)
    mortalidad = Column(Integer, default=0)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    farm = relationship("Farm", back_populates="lotes")

    __table_args__ = (Index("ix_lotes_farm", "farm_id"),)


class Venta(Base):
    """A sale record for ERP."""
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    codigo = Column(String(50), nullable=True)
    concepto = Column(String(300), nullable=False)
    cliente = Column(String(200), nullable=True)
    cantidad = Column(Integer, default=1)
    precio_unit = Column(Float, default=0)
    total = Column(Float, default=0)
    fecha = Column(String(10), nullable=True)
    estado = Column(String(50), default="Pendiente")
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    farm = relationship("Farm", back_populates="ventas")

    __table_args__ = (Index("ix_ventas_farm", "farm_id"),)


class Compra(Base):
    """A purchase record for ERP."""
    __tablename__ = "compras"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    codigo = Column(String(50), nullable=True)
    concepto = Column(String(300), nullable=False)
    proveedor = Column(String(200), nullable=True)
    cantidad = Column(Integer, default=1)
    precio_unit = Column(Float, default=0)
    total = Column(Float, default=0)
    fecha = Column(String(10), nullable=True)
    estado = Column(String(50), default="Pendiente")
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    farm = relationship("Farm", back_populates="compras")

    __table_args__ = (Index("ix_compras_farm", "farm_id"),)
