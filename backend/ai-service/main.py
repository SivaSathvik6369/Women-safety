import math
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field

app = FastAPI(title="Aegis Women Security - AI & Machine Learning Service", version="1.0.0")

class TelemetryPayload(BaseModel):
    user_id: int
    accelerometer_x: float = Field(..., example=0.12)
    accelerometer_y: float = Field(..., example=9.81) # Earth gravity
    accelerometer_z: float = Field(..., example=-0.05)
    gyroscope_x: float = Field(..., example=0.01)
    gyroscope_y: float = Field(..., example=0.02)
    gyroscope_z: float = Field(..., example=-0.01)
    speed_mps: float = Field(..., example=1.2) # walking speed

class VoicePayload(BaseModel):
    audio_transcript: str = Field(..., example="please help me, call the police")
    language: str = Field("en", example="en")

class RiskPredictPayload(BaseModel):
    latitude: float
    longitude: float
    time_of_day: int = Field(..., ge=0, le=23, example=23) # Hour
    street_lighting_lux: float = Field(..., example=5.0)
    density_population_sqkm: int = Field(..., example=1200)

class ChatbotPayload(BaseModel):
    message: str = Field(..., example="Where is the nearest police station?")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-service"}

@app.post("/ai/behavior-analysis")
def analyze_behavior(payload: TelemetryPayload):
    # Calculate magnitude of accelerometer force
    force_magnitude = math.sqrt(
        payload.accelerometer_x**2 + 
        payload.accelerometer_y**2 + 
        payload.accelerometer_z**2
    )
    
    status_label = "NORMAL_WALKING"
    alert_triggered = False
    details = "User motion conforms to default pedestrian gait dynamics."

    # 1. Fall Detection heuristic (High sudden force followed by low activity)
    if force_magnitude > 25.0: # high impact threshold
        status_label = "FALL_DETECTED"
        alert_triggered = True
        details = "High impact G-Force event detected. Check user responsiveness."
    # 2. Running Detection (High speed and frequency changes)
    elif payload.speed_mps > 4.5:
        status_label = "RUNNING_DETECTED"
        alert_triggered = True
        details = "Sudden acceleration and high-velocity running pattern detected."
        
    return {
        "status": status_label,
        "anomaly_detected": alert_triggered,
        "g_force_magnitude": round(force_magnitude, 2),
        "details": details
    }

@app.post("/ai/voice-recognition")
def parse_voice_phrases(payload: VoicePayload):
    trigger_phrases = ["help me", "save me", "emergency", "call police", "stop it", "police", "bachao"]
    transcript_lower = payload.audio_transcript.lower()
    
    alert_triggered = False
    matched_phrase = None
    
    for phrase in trigger_phrases:
        if phrase in transcript_lower:
            alert_triggered = True
            matched_phrase = phrase
            break
            
    return {
        "transcript_evaluated": payload.audio_transcript,
        "sos_voice_trigger": alert_triggered,
        "matched_phrase": matched_phrase,
        "confidence_score": 0.94 if alert_triggered else 0.05
    }

@app.post("/ai/face-recognition")
def match_face(
    image: UploadFile = File(...),
    trusted_group: str = Form("family") # family, watchlist
):
    # Simulates computer vision facial matching (OpenCV/MediaPipe pipeline)
    filename = image.filename
    print(f"Analyzing face in file: {filename} against group: {trusted_group}")
    
    # Mock validation returns
    if "stranger" in filename.lower() or "offender" in filename.lower():
        return {
            "matched": False,
            "match_found_in": trusted_group,
            "confidence": 0.12,
            "identified_subject": "Unknown Person",
            "threat_alert": True if trusted_group == "watchlist" else False
        }
        
    return {
        "matched": True,
        "match_found_in": "family",
        "confidence": 0.98,
        "identified_subject": "Sarah Doe (Sister)",
        "threat_alert": False
    }

@app.post("/ai/risk-prediction")
def predict_risk_score(payload: RiskPredictPayload):
    # Dynamic calculations of safety index:
    # 0 = Safe Zone, 100 = Crime Hotspot
    
    base_score = 10.0 # Standard safe zone baseline
    
    # 1. Lighting Penalty
    if payload.street_lighting_lux < 10.0:
        base_score += 35.0 # High risk for poorly lit roads
    # 2. Night Time Penalty (late night hours 22:00 to 05:00)
    if payload.time_of_day >= 22 or payload.time_of_day <= 5:
        base_score += 25.0
    # 3. Crowd Density Penalty (extremely low density increases isolation)
    if payload.density_population_sqkm < 100:
        base_score += 15.0

    risk_label = "SAFE_ZONE"
    if base_score > 70.0:
        risk_label = "HIGH_RISK_ZONE"
    elif base_score > 40.0:
        risk_label = "MODERATE_RISK_ZONE"
        
    return {
        "danger_score": min(base_score, 100.0),
        "zone_classification": risk_label,
        "contributing_factors": {
            "low_lighting": payload.street_lighting_lux < 10.0,
            "isolation_factor": payload.density_population_sqkm < 100,
            "night_travel": payload.time_of_day >= 22 or payload.time_of_day <= 5
        }
    }

@app.post("/ai/chatbot")
def consult_safety_chatbot(payload: ChatbotPayload):
    user_msg = payload.message.lower()
    
    # Basic intent matching for NLP simulation
    if "police" in user_msg:
        response = "The nearest police station is at 12th Avenue, Main Block (450m away). Phone helpline is 112."
    elif "first aid" in user_msg or "bleed" in user_msg or "hurt" in user_msg:
        response = "Apply firm pressure to the wound with a clean cloth. Elevate the injured area. Dial 102/108 for an ambulance immediately."
    elif "laws" in user_msg or "legal" in user_msg or "rights" in user_msg:
        response = "Under Section 354 of the IPC, you have the right to register a Zero FIR at any police station regardless of jurisdiction. You also have the right to free legal aid."
    else:
        response = "I am Aegis Safety Assistant. In case of danger, press the SOS button or shake your phone. How else can I guide you?"
        
    return {
        "reply": response,
        "intent_matched": "police_lookup" if "police" in user_msg else "general_safety",
        "action_required": "SHOW_MAP" if "police" in user_msg else "NONE"
    }
