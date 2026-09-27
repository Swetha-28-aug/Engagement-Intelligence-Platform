from fastapi import APIRouter

router = APIRouter(prefix="/api/ml/risk", tags=["Risk Engine"])


@router.get("/")
async def risk_placeholder():
    return {"message": "Risk engine endpoints — see Module 12"}
