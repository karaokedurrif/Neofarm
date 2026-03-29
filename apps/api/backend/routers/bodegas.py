from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_bodegas():
    return {"message": "Bodegas endpoint - TODO"}


@router.get("/{bodega_id}")
async def get_bodega(bodega_id: int):
    return {"message": f"Bodega {bodega_id} - TODO"}
