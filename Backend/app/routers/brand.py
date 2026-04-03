from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Brand
from app.services.ai_service import call_ai
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class BrandCreate(BaseModel):
    name: str
    industry: str
    target_audience: dict
    tone: List[str]
    guardrails: dict
    campaign: dict
    platforms: List[str]


@router.post("/setup")
def setup_brand(brand: BrandCreate, db: Session = Depends(get_db)):
    # Check if brand name already exists
    existing = db.query(Brand).filter(Brand.name == brand.name).first()
    if existing:
        db.delete(existing)
        db.commit()

    # AI validation of tone vs platform
    prompt = f"""
A brand called '{brand.name}' in the '{brand.industry}' industry has chosen these brand tones: {brand.tone}.
They are targeting these platforms: {brand.platforms}.

Briefly validate if these tone choices suit these platforms.
Give short, actionable advice in 2-3 sentences max.
Be direct and practical.
"""
    ai_feedback = call_ai(prompt, max_tokens=200)

    db_brand = Brand(**brand.dict())
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)

    return {"brand": db_brand, "ai_feedback": ai_feedback}


@router.get("/all")
def get_all_brands(db: Session = Depends(get_db)):
    return db.query(Brand).all()


@router.get("/{brand_id}")
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand
