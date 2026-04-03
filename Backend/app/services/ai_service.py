import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")


def call_ai(prompt: str, system: str = "", max_tokens: int = 4096) -> str:
    try:
        full_prompt = f"{system}\n\n{prompt}" if system else prompt
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.8,
            )
        )
        return response.text
    except Exception as e:
        return f"AI Error: {str(e)}"


def build_brand_context(brand: dict) -> str:
    tone = brand.get("tone") or []
    platforms = brand.get("platforms") or []
    guardrails = brand.get("guardrails") or {}
    audience = brand.get("target_audience") or {}
    campaign = brand.get("campaign") or {}

    return f"""
BRAND CONTEXT (strictly follow this for all content):
- Brand Name: {brand.get("name", "")}
- Industry: {brand.get("industry", "")}
- Target Audience Age: {audience.get("age", "")}
- Target Audience Interests: {audience.get("interests", "")}
- Target Audience Pain Points: {audience.get("pain_points", "")}
- Brand Tone: {", ".join(tone)}
- Keywords to ALWAYS include: {guardrails.get("include", [])}
- Words to ALWAYS avoid: {guardrails.get("avoid", [])}
- Campaign Name: {campaign.get("name", "")}
- Campaign Goal: {campaign.get("goal", "")}
- Campaign Duration: {campaign.get("duration", "")}
- Target Platforms: {", ".join(platforms)}
"""
