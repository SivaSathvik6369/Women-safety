import os
import sys
import unittest
import importlib.util
from fastapi.testclient import TestClient

def load_service_app(service_name, relative_path):
    """Dynamically loads the FastAPI 'app' object from main.py of the specified service."""
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), relative_path))
    spec = importlib.util.spec_from_file_location(service_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[service_name] = module
    spec.loader.exec_module(module)
    return module.app

class TestAegisMicroservices(unittest.TestCase):
    
    @classmethod
    def tearDownClass(cls):
        # Clean up temporary test sqlite files
        for db_file in ["test_user.db", "test_emergency.db"]:
            if os.path.exists(db_file):
                try:
                    os.remove(db_file)
                except Exception:
                    pass

    def test_auth_service(self):
        try:
            app = load_service_app("auth_service", "../backend/authentication-service/main.py")
            client = TestClient(app)
            
            # Test Health
            r = client.get("/health")
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["service"], "authentication-service")
            
            # Test Registration OTP Simulation
            payload = {
                "phone_number": "+1234567890",
                "full_name": "Jane Doe",
                "email": "jane@example.com",
                "password": "password123"
            }
            r = client.post("/auth/register", json=payload)
            self.assertEqual(r.status_code, 200)
            self.assertTrue(r.json()["otp_required"])
        except ImportError as e:
            self.skipTest(f"Missing local dependencies for auth service: {e}")

    def test_user_service(self):
        os.environ["DATABASE_URL"] = "sqlite:///./test_user.db"
        try:
            app = load_service_app("user_service", "../backend/user-service/main.py")
            client = TestClient(app)
            
            # Test Health
            r = client.get("/health")
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["service"], "user-service")
            
            # Test Mock profile lookup fallback
            r = client.get("/users/profile/+1234567890")
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["full_name"], "Demo User Jane")
        except ImportError as e:
            self.skipTest(f"Missing local dependencies for user service: {e}")

    def test_emergency_service(self):
        os.environ["DATABASE_URL"] = "sqlite:///./test_emergency.db"
        try:
            app = load_service_app("emergency_service", "../backend/emergency-service/main.py")
            client = TestClient(app)
            
            # Test Health
            r = client.get("/health")
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["service"], "emergency-service")
            
            # Test SOS activation triggers
            payload = {
                "user_id": 1,
                "latitude": 37.7749,
                "longitude": -122.4194
            }
            r = client.post("/emergency/sos/activate", json=payload)
            self.assertEqual(r.status_code, 200)
            self.assertIn("incident_id", r.json())
            self.assertEqual(r.json()["status"], "ACTIVE")
        except ImportError as e:
            self.skipTest(f"Missing local dependencies for emergency service: {e}")

    def test_gps_service(self):
        try:
            app = load_service_app("gps_service", "../backend/gps-service/main.py")
            client = TestClient(app)
            
            # Test Health
            r = client.get("/health")
            self.assertEqual(r.status_code, 200)
            
            # Test GPS coordinate evaluation and Geofencing safe status
            payload = {
                "user_id": 1,
                "latitude": 37.7749,
                "longitude": -122.4194
            }
            r = client.post("/gps/update", json=payload)
            self.assertEqual(r.status_code, 200)
            self.assertFalse(r.json()["geofence_violation"])
        except ImportError as e:
            self.skipTest(f"Missing local dependencies for GPS service: {e}")

    def test_notification_service(self):
        try:
            app = load_service_app("notification_service", "../backend/notification-service/main.py")
            client = TestClient(app)
            
            # Test Health
            r = client.get("/health")
            self.assertEqual(r.status_code, 200)
            
            # Test push notification broadcast mock channels
            payload = {
                "user_id": 1,
                "title": "Emergency Alert",
                "body": "User triggered SOS",
                "data": {"latitude": "37.7749", "longitude": "-122.4194"}
            }
            r = client.post("/notification/push", json=payload)
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["status"], "dispatched")
        except ImportError as e:
            self.skipTest(f"Missing local dependencies for notification service: {e}")

    def test_ai_service(self):
        try:
            app = load_service_app("ai_service", "../backend/ai-service/main.py")
            client = TestClient(app)
            
            # Test Health
            r = client.get("/health")
            self.assertEqual(r.status_code, 200)
            
            # Test AI fall-detection warning triggers
            fall_payload = {
                "user_id": 1,
                "accelerometer_x": 1.2,
                "accelerometer_y": 28.5, # High G-impact
                "accelerometer_z": -0.8,
                "gyroscope_x": 0.5,
                "gyroscope_y": 0.8,
                "gyroscope_z": 1.2,
                "speed_mps": 0.5
            }
            r = client.post("/ai/behavior-analysis", json=fall_payload)
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["status"], "FALL_DETECTED")
            self.assertTrue(r.json()["anomaly_detected"])
            
            # Test voice phrase trigger
            voice_payload = {
                "audio_transcript": "Someone follow me, please help me right away!",
                "language": "en"
            }
            r = client.post("/ai/voice-recognition", json=voice_payload)
            self.assertEqual(r.status_code, 200)
            self.assertTrue(r.json()["sos_voice_trigger"])
            self.assertEqual(r.json()["matched_phrase"], "help me")
        except ImportError as e:
            self.skipTest(f"Missing local dependencies for AI service: {e}")

if __name__ == "__main__":
    unittest.main()
