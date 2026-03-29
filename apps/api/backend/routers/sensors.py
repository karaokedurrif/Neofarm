from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_sensors():
    return {"message": "Sensors IoT endpoint - TODO"}
