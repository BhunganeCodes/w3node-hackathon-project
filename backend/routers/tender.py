from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_service import evaluate_tender

router = APIRouter()

class TenderRequest(BaseModel):
    bidData: dict

@router.post("/evaluate")
def evaluate(request: TenderRequest):
    score = evaluate_tender(request.bidData)
    return {
        "success": True,
        "score": score
    }