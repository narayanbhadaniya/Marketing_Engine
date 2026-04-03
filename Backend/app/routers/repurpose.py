from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Brand
from app.services.ai_service import call_ai, build_brand_context
from pydantic import BaseModel

router = APIRouter()


class RepurposeRequest(BaseModel):
    brand_id: int
    asset_name: str
    asset_type: str
    content: str


@router.post("/process")
def repurpose_content(req: RepurposeRequest, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == req.brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    brand_dict = {c.name: getattr(brand, c.name) for c in brand.__table__.columns}
    ctx = build_brand_context(brand_dict)

    prompt = f"""
{ctx}

You are repurposing a {req.asset_type} titled: "{req.asset_name}"

ORIGINAL CONTENT:
{req.content[:8000]}

First extract key information, then generate all content formats.
Add "Based on [{req.asset_name}]" attribution to each content piece.

## KEY_INSIGHTS
List the top 5 key insights as numbered bullet points

## QUOTABLE_LINES
List the 5 most quotable, shareable lines from the content

## SUMMARY
Write a 2-3 sentence summary of the main argument

## COVERAGE_MAP
Estimate which parts were most content-rich:
- Introduction: X%
- Middle sections: X%
- Conclusion: X%

## LINKEDIN_1
Thought leadership post based on the content (150-200 words)

## LINKEDIN_2
Story-based post from the content (150-200 words)

## LINKEDIN_3
Direct CTA post referencing the content (100-150 words)

## INSTAGRAM_CAPTION
Instagram caption with emojis based on content (80-120 words)

## INSTAGRAM_HASHTAGS
15 relevant hashtags

## TWITTER_1
Stat-based tweet from the content (max 280 chars)

## TWITTER_2
Question tweet based on content insight (max 280 chars)

## TWITTER_3
Hot take from the content (max 280 chars)

## VIDEO_SCRIPT_30S
30-second video script based on content

## EMAIL_NEWSLETTER
Subject line + body + CTA based on content

## BLOG_OUTLINE
H1, H2s and key points repurposed from the content

## GOOGLE_AD_1
Ad copy based on content's main value proposition

## SEO_META
SEO title and description for content as a landing page
"""

    result = call_ai(prompt, max_tokens=8000)
    return {"result": result, "asset_name": req.asset_name}
