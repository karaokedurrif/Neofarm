from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

from database import engine, get_db, Base
from models import Farm, Gallinero, Ave, Lote, Venta, Compra
from schemas import (
    FarmOut,
    GallineroCreate, GallineroUpdate, GallineroOut,
    AveCreate, AveUpdate, AveOut,
    LoteCreate, LoteUpdate, LoteOut,
    VentaCreate, VentaUpdate, VentaOut,
    CompraCreate, CompraUpdate, CompraOut,
)

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OvoSfera API", version="2.0.0")

# CORS
origins = os.getenv("CORS_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for internal Docker network
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup: seed farms if empty ─────────────────────
@app.on_event("startup")
def seed_farms():
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(Farm).count() == 0:
            db.add_all([
                Farm(slug="capones", name="Granja Los Capones", is_demo=True),
                Farm(slug="palacio", name="Palacio", is_demo=False),
            ])
            db.commit()
    finally:
        db.close()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ovosfera-api", "version": "2.0.0"}


@app.get("/")
async def root():
    return {"service": "OvoSfera API", "version": "2.0.0", "docs": "/docs"}


# ── Helper: get farm by slug or 404 ─────────────────
def get_farm_or_404(slug: str, db: Session) -> Farm:
    farm = db.query(Farm).filter(Farm.slug == slug).first()
    if not farm:
        raise HTTPException(status_code=404, detail=f"Farm '{slug}' not found")
    return farm


# ═══════════════════════════════════════════════════════
# GALLINEROS CRUD
# ═══════════════════════════════════════════════════════

@app.get("/farms/{slug}/gallineros", response_model=List[GallineroOut])
def list_gallineros(slug: str, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    return db.query(Gallinero).filter(Gallinero.farm_id == farm.id).order_by(Gallinero.id).all()


@app.post("/farms/{slug}/gallineros", response_model=GallineroOut, status_code=201)
def create_gallinero(slug: str, body: GallineroCreate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    g = Gallinero(farm_id=farm.id, **body.model_dump())
    db.add(g)
    db.commit()
    db.refresh(g)
    return g


@app.get("/farms/{slug}/gallineros/{gid}", response_model=GallineroOut)
def get_gallinero(slug: str, gid: int, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    g = db.query(Gallinero).filter(Gallinero.id == gid, Gallinero.farm_id == farm.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Gallinero not found")
    return g


@app.put("/farms/{slug}/gallineros/{gid}", response_model=GallineroOut)
def update_gallinero(slug: str, gid: int, body: GallineroUpdate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    g = db.query(Gallinero).filter(Gallinero.id == gid, Gallinero.farm_id == farm.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Gallinero not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(g, key, val)
    db.commit()
    db.refresh(g)
    return g


@app.delete("/farms/{slug}/gallineros/{gid}", status_code=204)
def delete_gallinero(slug: str, gid: int, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    g = db.query(Gallinero).filter(Gallinero.id == gid, Gallinero.farm_id == farm.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Gallinero not found")
    db.delete(g)
    db.commit()


# ═══════════════════════════════════════════════════════
# AVES CRUD
# ═══════════════════════════════════════════════════════

@app.get("/farms/{slug}/aves", response_model=List[AveOut])
def list_aves(slug: str, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    return db.query(Ave).filter(Ave.farm_id == farm.id).order_by(Ave.id).all()


@app.post("/farms/{slug}/aves", response_model=AveOut, status_code=201)
def create_ave(slug: str, body: AveCreate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    ave = Ave(farm_id=farm.id, **body.model_dump())
    db.add(ave)
    db.commit()
    db.refresh(ave)
    return ave


@app.get("/farms/{slug}/aves/{ave_id}", response_model=AveOut)
def get_ave(slug: str, ave_id: int, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    ave = db.query(Ave).filter(Ave.id == ave_id, Ave.farm_id == farm.id).first()
    if not ave:
        raise HTTPException(status_code=404, detail="Ave not found")
    return ave


@app.put("/farms/{slug}/aves/{ave_id}", response_model=AveOut)
def update_ave(slug: str, ave_id: int, body: AveUpdate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    ave = db.query(Ave).filter(Ave.id == ave_id, Ave.farm_id == farm.id).first()
    if not ave:
        raise HTTPException(status_code=404, detail="Ave not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(ave, key, val)
    db.commit()
    db.refresh(ave)
    return ave


@app.delete("/farms/{slug}/aves/{ave_id}", status_code=204)
def delete_ave(slug: str, ave_id: int, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    ave = db.query(Ave).filter(Ave.id == ave_id, Ave.farm_id == farm.id).first()
    if not ave:
        raise HTTPException(status_code=404, detail="Ave not found")
    db.delete(ave)
    db.commit()


# ═══════════════════════════════════════════════════════
# BULK IMPORT (for migrating localStorage data)
# ═══════════════════════════════════════════════════════

@app.post("/farms/{slug}/aves/bulk", response_model=List[AveOut], status_code=201)
def bulk_create_aves(slug: str, body: List[AveCreate], db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    aves = [Ave(farm_id=farm.id, **a.model_dump()) for a in body]
    db.add_all(aves)
    db.commit()
    for a in aves:
        db.refresh(a)
    return aves


@app.post("/farms/{slug}/gallineros/bulk", response_model=List[GallineroOut], status_code=201)
def bulk_create_gallineros(slug: str, body: List[GallineroCreate], db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    gs = [Gallinero(farm_id=farm.id, **g.model_dump()) for g in body]
    db.add_all(gs)
    db.commit()
    for g in gs:
        db.refresh(g)
    return gs


# ═══════════════════════════════════════════════════════
# LOTES (Production) CRUD
# ═══════════════════════════════════════════════════════

@app.get("/farms/{slug}/lotes", response_model=List[LoteOut])
def list_lotes(slug: str, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    return db.query(Lote).filter(Lote.farm_id == farm.id).order_by(Lote.id).all()


@app.post("/farms/{slug}/lotes", response_model=LoteOut, status_code=201)
def create_lote(slug: str, body: LoteCreate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    l = Lote(farm_id=farm.id, **body.model_dump())
    db.add(l)
    db.commit()
    db.refresh(l)
    return l


@app.put("/farms/{slug}/lotes/{lid}", response_model=LoteOut)
def update_lote(slug: str, lid: int, body: LoteUpdate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    l = db.query(Lote).filter(Lote.id == lid, Lote.farm_id == farm.id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lote not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(l, key, val)
    db.commit()
    db.refresh(l)
    return l


@app.delete("/farms/{slug}/lotes/{lid}", status_code=204)
def delete_lote(slug: str, lid: int, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    l = db.query(Lote).filter(Lote.id == lid, Lote.farm_id == farm.id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lote not found")
    db.delete(l)
    db.commit()


# ═══════════════════════════════════════════════════════
# VENTAS (ERP) CRUD
# ═══════════════════════════════════════════════════════

@app.get("/farms/{slug}/ventas", response_model=List[VentaOut])
def list_ventas(slug: str, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    return db.query(Venta).filter(Venta.farm_id == farm.id).order_by(Venta.id.desc()).all()


@app.post("/farms/{slug}/ventas", response_model=VentaOut, status_code=201)
def create_venta(slug: str, body: VentaCreate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    v = Venta(farm_id=farm.id, **body.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@app.put("/farms/{slug}/ventas/{vid}", response_model=VentaOut)
def update_venta(slug: str, vid: int, body: VentaUpdate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    v = db.query(Venta).filter(Venta.id == vid, Venta.farm_id == farm.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venta not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(v, key, val)
    db.commit()
    db.refresh(v)
    return v


@app.delete("/farms/{slug}/ventas/{vid}", status_code=204)
def delete_venta(slug: str, vid: int, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    v = db.query(Venta).filter(Venta.id == vid, Venta.farm_id == farm.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venta not found")
    db.delete(v)
    db.commit()


# ═══════════════════════════════════════════════════════
# COMPRAS (ERP) CRUD
# ═══════════════════════════════════════════════════════

@app.get("/farms/{slug}/compras", response_model=List[CompraOut])
def list_compras(slug: str, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    return db.query(Compra).filter(Compra.farm_id == farm.id).order_by(Compra.id.desc()).all()


@app.post("/farms/{slug}/compras", response_model=CompraOut, status_code=201)
def create_compra(slug: str, body: CompraCreate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    c = Compra(farm_id=farm.id, **body.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@app.put("/farms/{slug}/compras/{cid}", response_model=CompraOut)
def update_compra(slug: str, cid: int, body: CompraUpdate, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    c = db.query(Compra).filter(Compra.id == cid, Compra.farm_id == farm.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Compra not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(c, key, val)
    db.commit()
    db.refresh(c)
    return c


@app.delete("/farms/{slug}/compras/{cid}", status_code=204)
def delete_compra(slug: str, cid: int, db: Session = Depends(get_db)):
    farm = get_farm_or_404(slug, db)
    c = db.query(Compra).filter(Compra.id == cid, Compra.farm_id == farm.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Compra not found")
    db.delete(c)
    db.commit()
