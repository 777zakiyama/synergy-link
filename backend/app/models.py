from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    profile = Column(JSON, nullable=True)
    network = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
