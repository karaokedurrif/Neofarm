from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
async def login():
    return {"message": "Auth endpoint - TODO"}


@router.post("/register")
async def register():
    return {"message": "Register endpoint - TODO"}
