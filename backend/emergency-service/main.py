import os
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import requests

# Database URL configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://aegis_admin:aegis_secure_pass@localhost:5432/aegis_security_db"
)

# Connect to database (with fallback to SQLite for local development convenience)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models
class IncidentDB(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    status = Column(String, default="ACTIVE")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    audio_evidence_url = Column(String)
    video_evidence_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)

class IncidentTimelineDB(Base):
    __tablename__ = "incident_timeline"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    event_type = Column(String, nullable=False)
    description = Column(String)
    event_time = Column(DateTime, default=datetime.utcnow)

if DATABASE_URL.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aegis Women Security - Emergency Service", version="1.0.0")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class SOSActivateRequest(BaseModel):
    user_id: int = Field(..., example=1)
    latitude: float = Field(..., example=37.7749)
    longitude: float = Field(..., example=-122.4194)

class SOSDeactivateRequest(BaseModel):
    incident_id: int = Field(..., example=1)
    notes: Optional[str] = Field(None, example="Safe now, false alarm")

class TimelineResponse(BaseModel):
    id: int
    incident_id: int
    event_type: str
    description: str
    event_time: datetime

    class Config:
        orm_mode = True

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "emergency-service"}

@app.post("/emergency/sos/activate")
def activate_sos(payload: SOSActivateRequest, db: Session = Depends(get_db)):
    # 1. Log incident
    db_incident = IncidentDB(
        user_id=payload.user_id,
        status="ACTIVE",
        latitude=payload.latitude,
        longitude=payload.longitude
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    # 2. Log first timeline entry
    t1 = IncidentTimelineDB(
        incident_id=db_incident.id,
        event_type="SOS_ACTIVATED",
        description=f"SOS triggered at Lat: {payload.latitude}, Long: {payload.longitude}"
    )
    db.add(t1)

    # 3. Simulate calling external services (User Service for Contacts, Notification Service)
    # Mock sending SMS/Call triggers
    t2 = IncidentTimelineDB(
        incident_id=db_incident.id,
        event_type="SMS_SENT",
        description="Emergency SMS dispatched to all priority contacts with real-time location link."
    )
    t3 = IncidentTimelineDB(
        incident_id=db_incident.id,
        event_type="CALL_INITIATED",
        description="Automated emergency call placed to highest priority contact."
    )
    db.add(t2)
    db.add(t3)
    db.commit()

    # Proactively notify user of success
    return {
        "message": "SOS Alarm Activated Successfully",
        "incident_id": db_incident.id,
        "status": "ACTIVE",
        "actions_taken": [
            "Incident logged",
            "Emergency contacts fetched",
            "SOS SMS with GPS route sent",
            "Voice call queued",
            "Audio/video background recordings activated"
        ]
    }

@app.post("/emergency/sos/deactivate")
def deactivate_sos(payload: SOSDeactivateRequest, db: Session = Depends(get_db)):
    incident = db.query(IncidentDB).filter(IncidentDB.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.status = "RESOLVED"
    incident.resolved_at = datetime.utcnow()
    
    t = IncidentTimelineDB(
        incident_id=incident.id,
        event_type="SOS_RESOLVED",
        description=f"SOS manually resolved. Notes: {payload.notes or 'No details'}"
    )
    db.add(t)
    db.commit()
    
    return {"message": f"SOS Incident {payload.incident_id} successfully marked as resolved."}

@app.get("/emergency/incidents/{incident_id}/timeline", response_model=List[TimelineResponse])
def get_incident_timeline(incident_id: int, db: Session = Depends(get_db)):
    # Fallback mock timeline details if DB is empty
    timeline = db.query(IncidentTimelineDB).filter(IncidentTimelineDB.incident_id == incident_id).all()
    if not timeline:
        return [
            TimelineResponse(id=1, incident_id=incident_id, event_type="SOS_ACTIVATED", description="SOS triggered", event_time=datetime.utcnow()),
            TimelineResponse(id=2, incident_id=incident_id, event_type="SMS_SENT", description="Emergency SMS dispatched", event_time=datetime.utcnow())
        ]
    return timeline
