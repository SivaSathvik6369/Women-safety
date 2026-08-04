import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status, Depends
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

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
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    blood_group = Column(String)
    medical_conditions = Column(Text)
    allergies = Column(Text)

class EmergencyContactDB(Base):
    __tablename__ = "emergency_contacts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    contact_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    priority = Column(Integer, default=1)
    relationship = Column(String)
    is_active = Column(Boolean, default=True)

# Create tables if SQLite is used
if DATABASE_URL.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aegis Women Security - User Service", version="1.0.0")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class MedicalInfo(BaseModel):
    blood_group: Optional[str] = Field(None, example="O+")
    medical_conditions: Optional[str] = Field(None, example="Asthma")
    allergies: Optional[str] = Field(None, example="Penicillin")

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, example="Jane Doe")
    email: Optional[str] = Field(None, example="jane.doe@example.com")
    medical_info: Optional[MedicalInfo] = None

class ContactCreate(BaseModel):
    contact_name: str = Field(..., example="Mom")
    phone_number: str = Field(..., example="+1234567891")
    priority: int = Field(1, ge=1, le=3, description="1=High, 2=Medium, 3=Low")
    relationship: Optional[str] = Field(None, example="Mother")

class ContactResponse(BaseModel):
    id: int
    contact_name: str
    phone_number: str
    priority: int
    relationship: Optional[str]
    is_active: bool

    class Config:
        orm_mode = True

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "user-service"}

@app.get("/users/profile/{phone_number}")
def get_user_profile(phone_number: str, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.phone_number == phone_number).first()
    if not user:
        # Fallback Mock User for Demo testing
        if phone_number == "+1234567890":
            return {
                "phone_number": "+1234567890",
                "full_name": "Demo User Jane",
                "email": "jane@aegis.com",
                "blood_group": "A+",
                "medical_conditions": "None",
                "allergies": "Peanuts"
            }
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "phone_number": user.phone_number,
        "full_name": user.full_name,
        "email": user.email,
        "blood_group": user.blood_group,
        "medical_conditions": user.medical_conditions,
        "allergies": user.allergies
    }

@app.put("/users/profile/{phone_number}")
def update_user_profile(phone_number: str, profile: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.phone_number == phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if profile.full_name:
        user.full_name = profile.full_name
    if profile.email:
        user.email = profile.email
    if profile.medical_info:
        user.blood_group = profile.medical_info.blood_group
        user.medical_conditions = profile.medical_info.medical_conditions
        user.allergies = profile.medical_info.allergies
    
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully"}

@app.post("/users/{phone_number}/contacts", response_model=ContactResponse)
def add_emergency_contact(phone_number: str, contact: ContactCreate, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.phone_number == phone_number).first()
    user_id = user.id if user else 1 # Default mock user_id if DB not seeded
    
    db_contact = EmergencyContactDB(
        user_id=user_id,
        contact_name=contact.contact_name,
        phone_number=contact.phone_number,
        priority=contact.priority,
        relationship=contact.relationship
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.get("/users/{phone_number}/contacts", response_model=List[ContactResponse])
def get_emergency_contacts(phone_number: str, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.phone_number == phone_number).first()
    if not user:
        # Mock contacts for testing
        return [
            ContactResponse(id=1, contact_name="Family Group (SOS)", phone_number="+1234567891", priority=1, relationship="Mother", is_active=True),
            ContactResponse(id=2, contact_name="Police Helpline", phone_number="112", priority=1, relationship="Official", is_active=True)
        ]
    
    contacts = db.query(EmergencyContactDB).filter(EmergencyContactDB.user_id == user.id).all()
    return contacts
