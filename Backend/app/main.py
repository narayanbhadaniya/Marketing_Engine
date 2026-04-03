from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import brand, content, repurpose, adcopy, sentiment, calendar

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Marketing Intelligence Engine",
    version="1.0.0",
    description="AI-powered marketing workspace using Google Gemini"
)

# CORS - allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(brand.router, prefix="/api/brand", tags=["Brand"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(repurpose.router, prefix="/api/repurpose", tags=["Repurpose"])
app.include_router(adcopy.router, prefix="/api/adcopy", tags=["Ad Copy"])
app.include_router(sentiment.router, prefix="/api/sentiment", tags=["Sentiment"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])


@app.get("/")
def root():
    return {"status": "AI Marketing Engine is running", "version": "1.0.0"}
