from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ContentPiece, Brand
from app.services.ai_service import call_ai
from pydantic import BaseModel

router = APIRouter()


class ScheduleUpdate(BaseModel):
    content_id: int
    scheduled_date: str
    status: str


@router.get("/items/{brand_id}")
def get_calendar_items(brand_id: int, db: Session = Depends(get_db)):
    return db.query(ContentPiece).filter(ContentPiece.brand_id == brand_id).all()


@router.put("/schedule")
def update_schedule(data: ScheduleUpdate, db: Session = Depends(get_db)):
    piece = db.query(ContentPiece).filter(ContentPiece.id == data.content_id).first()
    if not piece:
        raise HTTPException(status_code=404, detail="Content piece not found")
    piece.scheduled_date = data.scheduled_date
    piece.status = data.status
    db.commit()
    return {"updated": True}


@router.get("/suggest/{brand_id}")
def suggest_schedule(brand_id: int, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    pieces = db.query(ContentPiece).filter(ContentPiece.brand_id == brand_id).all()
    platforms = list(set([p.platform for p in pieces if p.platform]))
    campaign = brand.campaign or {}

    prompt = f"""
A marketing team has content for these platforms: {platforms}
Campaign duration: {campaign.get("duration", "30 days")}
Campaign goal: {campaign.get("goal", "Awareness")}

Suggest a specific optimal posting schedule for each platform.
Include best days and times based on industry research.
Keep response under 150 words. Be specific and practical.
"""
    suggestion = call_ai(prompt, max_tokens=300)
    return {"suggestion": suggestion}
