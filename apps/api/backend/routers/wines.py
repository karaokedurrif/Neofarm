from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_wines():
    return {"message": "Wines endpoint - TODO"}


@router.get("/{wine_id}")
async def get_wine(wine_id: int):
    return {"message": f"Wine {wine_id} - TODO"}
