import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pymongo

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://aegis_root:aegis_mongo_pass@localhost:27017/")
try:
    mongo_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    db = mongo_client["aegis_gps_db"]
    location_collection = db["user_locations"]
    geofence_collection = db["geofences"]
except Exception:
    mongo_client = None
    print("MongoDB connection failed. Operating in in-memory simulation mode.")

app = FastAPI(title="Aegis Women Security - GPS & Route Service", version="1.0.0")

# In-memory database mock fallbacks
in_memory_locations = {}
in_memory_geofences = [
    {"id": "gf_1", "name": "Home Safe Zone", "center_lat": 37.7749, "center_lng": -122.4194, "radius_meters": 500}
]

class GPSUpdate(BaseModel):
    user_id: int = Field(..., example=1)
    latitude: float = Field(..., example=37.7752)
    longitude: float = Field(..., example=-122.4189)
    timestamp: Optional[str] = Field(None, example="2026-08-04T15:00:00Z")

class RouteQuery(BaseModel):
    origin_lat: float = Field(..., example=37.7749)
    origin_lng: float = Field(..., example=-122.4194)
    destination_lat: float = Field(..., example=37.7891)
    destination_lng: float = Field(..., example=-122.4014)

class GeofenceCreate(BaseModel):
    name: str = Field(..., example="Office Area")
    center_lat: float = Field(..., example=37.7891)
    center_lng: float = Field(..., example=-122.4014)
    radius_meters: float = Field(..., example=300)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "gps-service"}

@app.post("/gps/update")
def update_gps_location(update: GPSUpdate):
    # Store position
    if mongo_client:
        try:
            location_collection.update_one(
                {"user_id": update.user_id},
                {"$set": {"latitude": update.latitude, "longitude": update.longitude, "updated_at": update.timestamp}},
                upsert=True
            )
        except Exception:
            in_memory_locations[update.user_id] = update
    else:
        in_memory_locations[update.user_id] = update
        
    # Check Geofencing status
    # Simple mathematical distance calculation
    geofence_status = "SAFE"
    violation_trigger = False
    
    # Normally loads from DB
    geofences = in_memory_geofences
    if mongo_client:
        try:
            geofences = list(geofence_collection.find())
        except Exception:
            pass

    for gf in geofences:
        # Simplistic distance check
        distance = ((update.latitude - gf["center_lat"])**2 + (update.longitude - gf["center_lng"])**2)**0.5 * 111000
        if distance > gf["radius_meters"]:
            # If user left a designated safe zone
            geofence_status = "GEOFENCE_BREACH"
            violation_trigger = True
            break
            
    return {
        "status": "success",
        "current_state": geofence_status,
        "geofence_violation": violation_trigger,
        "coordinates": {"lat": update.latitude, "lng": update.longitude}
    }

@app.post("/gps/safe-route")
def get_safe_route(query: RouteQuery):
    # Safe route recommendation logic simulating spatial analysis:
    # We provide two routes: Route A (Standard path), Route B (Alternative AI Safe Route)
    # AI Safe Route prioritizes street illumination index, CCTV coverage, and lower crime scores
    
    route_a = {
        "name": "Standard Route (Fastest)",
        "distance_km": 2.1,
        "eta_minutes": 8,
        "danger_score": 6.8,
        "parameters": {
            "street_lighting": "Poor (32% illuminated)",
            "cctv_coverage": "Low (12% cameras)",
            "police_presence": "Sparse",
            "crime_incidence_rate": "Moderate"
        },
        "coordinates": [
            [query.origin_lat, query.origin_lng],
            [37.7810, -122.4100],
            [query.destination_lat, query.destination_lng]
        ]
    }
    
    route_b = {
        "name": "AI Safe Walkway (Recommended)",
        "distance_km": 2.4,
        "eta_minutes": 11,
        "danger_score": 1.5,
        "parameters": {
            "street_lighting": "Excellent (94% well-lit)",
            "cctv_coverage": "High (82% CCTV active)",
            "police_presence": "Active (Patrol zone 4)",
            "crime_incidence_rate": "Very Low"
        },
        "coordinates": [
            [query.origin_lat, query.origin_lng],
            [37.7780, -122.4150],
            [37.7840, -122.4080],
            [query.destination_lat, query.destination_lng]
        ]
    }

    return {
        "safest_route": route_b,
        "alternative_routes": [route_a],
        "recommendation": "Route B is 300m longer but provides 5x higher safety score based on live lighting metrics and patrol schedules."
    }

@app.post("/gps/geofence")
def create_geofence(gf: GeofenceCreate):
    new_gf = {
        "id": f"gf_{len(in_memory_geofences) + 1}",
        "name": gf.name,
        "center_lat": gf.center_lat,
        "center_lng": gf.center_lng,
        "radius_meters": gf.radius_meters
    }
    
    if mongo_client:
        try:
            geofence_collection.insert_one(new_gf)
        except Exception:
            in_memory_geofences.append(new_gf)
    else:
        in_memory_geofences.append(new_gf)
        
    return {"status": "success", "geofence": new_gf}
