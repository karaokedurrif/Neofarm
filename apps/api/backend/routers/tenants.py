from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_tenants():
    return {"message": "Tenants endpoint - TODO"}
