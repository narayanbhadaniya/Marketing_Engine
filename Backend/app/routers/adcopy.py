from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Brand, AdVariant
from app.services.ai_service import call_ai, build_brand_context
from pydantic import BaseModel

router = APIRouter()


class AdRequest(BaseModel):
    brand_id: int
    product: str
    audience: str
    platform: str
    goal: str


class StatusUpdate(BaseModel):
    status: str


@router.post("/generate")
def generate_ads(req: AdRequest, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == req.brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    brand_dict = {c.name: getattr(brand, c.name) for c in brand.__table__.columns}
    ctx = build_brand_context(brand_dict)

    prompt = f"""
{ctx}

Product/Service: {req.product}
Target Audience: {req.audience}
Platform: {req.platform}
Goal: {req.goal}

Generate exactly 5 ad copy variants. Each uses a DIFFERENT persuasion tone.
Use EXACTLY these section headers:

## VARIANT_1 | Emotional
Write ad copy that appeals to emotions and feelings.
Headline: (max 30 chars)
Body: (max 125 chars)
CTA: (max 20 chars)

## VARIANT_2 | Logical
Write ad copy that uses facts, stats, and logical reasoning.
Headline: (max 30 chars)
Body: (max 125 chars)
CTA: (max 20 chars)

## VARIANT_3 | Urgency
Write ad copy that creates urgency and FOMO.
Headline: (max 30 chars)
Body: (max 125 chars)
CTA: (max 20 chars)

## VARIANT_4 | Social Proof
Write ad copy that uses social proof and credibility.
Headline: (max 30 chars)
Body: (max 125 chars)
CTA: (max 20 chars)

## VARIANT_5 | Curiosity
Write ad copy that sparks curiosity and intrigue.
Headline: (max 30 chars)
Body: (max 125 chars)
CTA: (max 20 chars)

## RECOMMENDATION
Which single variant is best for {req.platform} and why. One sentence only.

## PERFORMANCE_PREDICTION
Which variant will likely get highest CTR on {req.platform} based on platform best practices. One sentence only.
"""

    raw = call_ai(prompt, max_tokens=2000)

    # Parse and save variants
    lines = raw.split('\n')
    current_tone = None
    current_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## VARIANT_') and '|' in stripped:
            if current_tone and current_lines:
                content = '\n'.join(current_lines).strip()
                v = AdVariant(
                    brand_id=req.brand_id,
                    platform=req.platform,
                    content=content,
                    tone_type=current_tone,
                    status="Testing"
                )
                db.add(v)
            parts = stripped.split('|')
            current_tone = parts[1].strip() if len(parts) > 1 else "Mixed"
            current_lines = []
        elif stripped.startswith('## RECOMMENDATION') or stripped.startswith('## PERFORMANCE'):
            if current_tone and current_lines:
                content = '\n'.join(current_lines).strip()
                v = AdVariant(
                    brand_id=req.brand_id,
                    platform=req.platform,
                    content=content,
                    tone_type=current_tone,
                    status="Testing"
                )
                db.add(v)
                current_tone = None
                current_lines = []
        else:
            current_lines.append(line)

    db.commit()
    return {"raw": raw}


@router.put("/status/{variant_id}")
def update_status(variant_id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    variant = db.query(AdVariant).filter(AdVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    variant.status = data.status
    db.commit()
    return {"updated": True}
