from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.database import Base
from datetime import datetime


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    industry = Column(String)
    target_audience = Column(JSON)
    tone = Column(JSON)
    guardrails = Column(JSON)
    campaign = Column(JSON)
    platforms = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


class ContentPiece(Base):
    __tablename__ = "content_pieces"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, index=True)
    type = Column(String)
    content = Column(Text)
    platform = Column(String)
    status = Column(String, default="Draft")
    scheduled_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AdVariant(Base):
    __tablename__ = "ad_variants"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, index=True)
    platform = Column(String)
    content = Column(Text)
    tone_type = Column(String)
    status = Column(String, default="Testing")
    created_at = Column(DateTime, default=datetime.utcnow)
