from fastapi import APIRouter, UploadFile, File, Form
from app.services.ai_service import call_ai
import pandas as pd
import io

router = APIRouter()


@router.post("/analyse")
async def analyse_sentiment(
    file: UploadFile = File(...),
    brand_context: str = Form(default="")
):
    content = await file.read()

    try:
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        # Take first column as reviews
        reviews = df.iloc[:, 0].astype(str).tolist()[:200]
        reviews_text = '\n'.join([f"- {r}" for r in reviews if r and r != 'nan'])
    except Exception:
        return {"error": "Could not parse CSV. Make sure first column contains review text."}

    prompt = f"""
You are a marketing intelligence analyst. Analyse these customer reviews:

{reviews_text}

Provide a thorough analysis using EXACTLY these section headers:

## SENTIMENT_SCORE
Overall sentiment breakdown:
Positive: X%
Neutral: X%
Negative: X%

## POSITIVE_THEMES
Top 5 recurring themes in positive feedback (numbered list, what customers love)

## NEGATIVE_THEMES
Top 5 recurring themes in negative feedback (numbered list, what customers dislike or want improved)

## HIGH_IMPACT_COMMENTS
The 3 most emotional or impactful comments (quote them directly from the reviews)

## CAMPAIGN_ANGLES
3 specific campaign angles the marketing team should use based on what resonates most with customers

## VOICE_OF_CUSTOMER
One paragraph (3-4 sentences) summarising the customer voice, written as marketing-ready copy that can be used directly in materials

## WORD_CLOUD_TERMS
The top 20 most frequent meaningful terms from reviews, comma-separated (exclude stop words like the, a, is, etc.)
"""

    result = call_ai(prompt, max_tokens=2000)
    return {"analysis": result}
