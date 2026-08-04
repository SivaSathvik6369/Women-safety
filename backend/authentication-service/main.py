import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Depends
from pydantic import BaseModel, Field
import bcrypt
import jwt

# Secret configuration
SECRET_KEY = os.getenv("JWT_SECRET", "super_secret_aegis_key_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

app = FastAPI(title="Aegis Women Security - Authentication Service", version="1.0.0")

class UserRegister(BaseModel):
    phone_number: str = Field(..., example="+1234567890")
    full_name: str = Field(..., example="Jane Doe")
    email: Optional[str] = Field(None, example="jane.doe@example.com")
    password: str = Field(..., min_length=6, example="password123")

class UserLogin(BaseModel):
    phone_number: str = Field(..., example="+1234567890")
    password: str = Field(..., example="password123")

class OTPVerification(BaseModel):
    phone_number: str = Field(..., example="+1234567890")
    otp_code: str = Field(..., example="123456")

# In-memory storage helper (representing cache/database validation for mock OTP)
mock_otp_db = {}

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "authentication-service"}

@app.post("/auth/register")
def register_user(user: UserRegister):
    # Hash password and create temporary record
    hashed = hash_password(user.password)
    # Simulate sending OTP
    mock_otp_db[user.phone_number] = "123456" # For mock purposes
    return {
        "message": "User registration initiated. OTP sent to phone number.",
        "phone_number": user.phone_number,
        "otp_required": True
    }

@app.post("/auth/verify-otp")
def verify_otp(otp_data: OTPVerification):
    stored_otp = mock_otp_db.get(otp_data.phone_number)
    if not stored_otp or stored_otp != otp_data.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP or phone number"
        )
    # Clear OTP
    mock_otp_db.pop(otp_data.phone_number, None)
    
    # Generate Auth Token
    access_token = create_access_token(
        data={"sub": otp_data.phone_number}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "OTP verification successful. Access granted."
    }

@app.post("/auth/login")
def login(credentials: UserLogin):
    # Mock authentication - normally links with DB
    # We will assume a mock user is in system for demo
    if credentials.phone_number == "+1234567890" and credentials.password == "password123":
        access_token = create_access_token(data={"sub": credentials.phone_number})
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect phone number or password"
    )

@app.get("/auth/verify-token")
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
        return {"phone_number": phone_number, "valid": True}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token signature")
