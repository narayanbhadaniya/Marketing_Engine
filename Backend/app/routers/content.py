from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Brand, ContentPiece
from app.services.ai_service import call_ai, build_brand_context
from pydantic import BaseModel

router = APIRouter()


class ContentRequest(BaseModel):
    brand_id: int
    topic: str


class RefineRequest(BaseModel):
    content: str
    instruction: str


def parse_sections(raw: str) -> dict:
    sections = {}
    current_key = None
    current_lines = []

    for line in raw.split('\n'):
        stripped = line.strip()
        if stripped.startswith('## '):
            if current_key:
                sections[current_key] = '\n'.join(current_lines).strip()
            # Extract key: take text after ## and before any parenthesis
            key_raw = stripped[3:].split('(')[0].strip()
            current_key = key_raw
            current_lines = []
        else:
            current_lines.append(line)

    if current_key:
        sections[current_key] = '\n'.join(current_lines).strip()

    return sections


@router.post("/generate")
def generate_content(req: ContentRequest, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == req.brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    brand_dict = {c.name: getattr(brand, c.name) for c in brand.__table__.columns}
    ctx = build_brand_context(brand_dict)

    prompt = f"""
{ctx}

Campaign Topic / Brief: {req.topic}

You are an expert marketing copywriter. Generate ALL of the following content formats.
Use EXACTLY these section headers (with ## prefix). Do not add extra headers.
All content must strictly follow the brand tone, include required keywords, and avoid banned words.

## LINKEDIN_1
Write a thought leadership LinkedIn post (150-200 words)

## LINKEDIN_2
Write a personal story-based LinkedIn post (150-200 words)

## LINKEDIN_3
Write a direct CTA LinkedIn post (100-150 words)

## INSTAGRAM_CAPTION
Write an Instagram caption with emojis (80-120 words)

## INSTAGRAM_HASHTAGS
Write 15-20 relevant hashtags (no emojis, just hashtags)

## TWITTER_1
Write a stat-based tweet (max 280 chars)

## TWITTER_2
Write a question-based tweet (max 280 chars)

## TWITTER_3
Write a hot take tweet (max 280 chars)

## TWITTER_4
Write a tip tweet (max 280 chars)

## TWITTER_5
Write an announcement tweet (max 280 chars)

## VIDEO_SCRIPT_30S
Write a 30-second video script with Hook, Body, CTA sections

## VIDEO_SCRIPT_60S
Write a 60-second video script with Hook, Body, CTA sections

## EMAIL_NEWSLETTER
Write Subject Line, Body (200 words), and CTA

## BLOG_OUTLINE
Write H1 title, 4-5 H2 sections with 3 key points each, and suggested word count

## GOOGLE_AD_1
Write Headline (30 chars max) and Description (90 chars max)

## GOOGLE_AD_2
Write Headline (30 chars max) and Description (90 chars max)

## GOOGLE_AD_3
Write Headline (30 chars max) and Description (90 chars max)

## SEO_META
Write SEO Meta Title (60 chars max) and Meta Description (160 chars max)
"""

    raw = call_ai(prompt, max_tokens=8000)
    content_sections = parse_sections(raw)

    # Save each section to DB
    for key, value in content_sections.items():
        if value:
            platform = key.split('_')[0]
            piece = ContentPiece(
                brand_id=req.brand_id,
                type=key,
                content=value,
                platform=platform,
                status="Draft"
            )
            db.add(piece)
    db.commit()

    return {"content": content_sections, "topic": req.topic}


@router.post("/refine")
def refine_content(req: RefineRequest):
    prompt = f"""
Original marketing content:
{req.content}

User instruction: {req.instruction}

Rewrite the content following the instruction exactly.
Keep it professional and marketing-ready.
Return only the rewritten content, nothing else.
"""
    refined = call_ai(prompt, max_tokens=1000)
    return {"refined": refined}


@router.get("/pieces/{brand_id}")
def get_pieces(brand_id: int, db: Session = Depends(get_db)):
    return db.query(ContentPiece).filter(ContentPiece.brand_id == brand_id).all()
