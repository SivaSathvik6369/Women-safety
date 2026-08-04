import json
from typing import List, Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Aegis Women Security - Notification Service", version="1.0.0")

class PushNotificationRequest(BaseModel):
    user_id: int = Field(..., example=1)
    title: str = Field(..., example="Emergency Alert!")
    body: str = Field(..., example="Jane Doe has triggered SOS. Tap to view location.")
    data: Dict[str, str] = Field(default={}, example={"latitude": "37.7749", "longitude": "-122.4194"})

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        # Maps user_id to list of active websockets (can support multiple devices)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"User {user_id} connected via WebSocket.")

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"User {user_id} disconnected from WebSocket.")

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

    async def broadcast(self, message: str):
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass

manager = ConnectionManager()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "notification-service"}

@app.post("/notification/push")
async def send_push_notification(payload: PushNotificationRequest):
    # In a real setup, integrations with Firebase Admin SDK happen here
    # Mocking push notification response
    print(f"Simulating FCM Push to User {payload.user_id}: Title: {payload.title}, Body: {payload.body}")
    
    # Also broadcast via active WebSockets if available
    ws_payload = json.dumps({
        "type": "PUSH_NOTIFICATION",
        "title": payload.title,
        "body": payload.body,
        "data": payload.data
    })
    await manager.send_personal_message(ws_payload, payload.user_id)
    
    return {
        "status": "dispatched",
        "channel": "FCM (Firebase Cloud Messaging) & WebSockets",
        "recipient_id": payload.user_id,
        "notification_details": {
            "title": payload.title,
            "body": payload.body
        }
    }

@app.post("/notification/broadcast-emergency")
async def broadcast_emergency(payload: PushNotificationRequest):
    # Broadcast to all open connections (simulating police dashboard feeds or emergency units)
    ws_payload = json.dumps({
        "type": "BROADCAST_SOS",
        "sender_id": payload.user_id,
        "title": payload.title,
        "body": payload.body,
        "data": payload.data
    })
    await manager.broadcast(ws_payload)
    return {"status": "broadcasted", "active_listeners": len(manager.active_connections)}

@app.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Maintain connection alive and listen for ping/pong or Client commands
            data = await websocket.receive_text()
            # Echo or process custom commands
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
