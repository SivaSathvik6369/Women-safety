# 🛡️ Aegis — Women Safety System

> An AI-powered women safety application with real-time SOS alerts, safe route navigation, police station lookup, AI chatbot, and fake call generator — built for India.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-blueviolet.svg)](https://expo.dev)

---

## 📸 Overview

Aegis is a full-stack women safety system designed for real-world use across India. It combines:

- **One-touch SOS** with multi-channel emergency alerts (SMS, call, WhatsApp)
- **Safe Route Finder** — multi-modal navigation (walk, drive, transit) with safety scoring
- **Nearest Police Station** lookup by live GPS with Google Maps directions
- **AI Chatbot** for safety tips, legal rights, first-aid guidance
- **Fake Call Generator** to escape unsafe situations
- **Live Geocoding** for any Indian landmark, road, city or address

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              React Native App (Expo)                │
│  AuthScreen │ Dashboard │ SOS │ Map │ Chat │ Profile │
└────────────────────────┬────────────────────────────┘
                         │ HTTP REST API
┌────────────────────────▼────────────────────────────┐
│            FastAPI Backend (Python)                 │
│  /sos  /safe-route  /geocode  /police-stations      │
│  /chatbot  /fake-call  /auth  /profile              │
└──────┬──────────────────┬────────────────┬──────────┘
       │                  │                │
  OpenStreetMap      Nominatim        Overpass API
  OSRM Routing       Geocoding        POI Lookup
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🆘 **Smart SOS** | One-touch emergency broadcast to contacts + police |
| 🗺️ **Safe Route Finder** | Walk / Drive / Transit routes with safety scoring |
| 👮 **Police Lookup** | Nearest police stations by GPS, with call & directions |
| 🤖 **AI Chatbot** | Legal rights, safety tips, emergency procedures |
| 📞 **Fake Call** | Realistic incoming call simulation to escape danger |
| 🔐 **Secure Auth** | JWT-based authentication with profile management |
| 📍 **Live Geocoding** | 5-tier geocoding — any Indian city, road, or landmark |
| 🏥 **Emergency Services** | Nearby hospitals, NGOs, and public transport |

---

## 🛠️ Technology Stack

| Layer | Technology |
|:---|:---|
| **Mobile App** | React Native (Expo) |
| **Web Dashboard** | Vanilla JS + Leaflet.js |
| **Backend API** | FastAPI (Python 3.10+) |
| **Routing Engine** | OSRM (Open Source Routing Machine) |
| **Geocoding** | Nominatim / Photon / OpenStreetMap |
| **POI Lookup** | Overpass API |
| **Maps** | Leaflet.js (OpenStreetMap tiles) |

> **No paid APIs required** — entirely free & open-source stack.

---

## 📁 Repository Layout

```
women-safety-system/
├── backend/
│   └── main.py              # FastAPI monolith — all endpoints
├── frontend-web/
│   ├── index.html           # Web dashboard
│   ├── app.js               # Map, routing, geocoding logic
│   └── style.css            # Dark theme styling
├── frontend/
│   ├── App.js               # React Native navigator
│   ├── screens/
│   │   ├── AuthScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── SOSScreen.js
│   │   ├── MapScreen.js
│   │   ├── ChatbotScreen.js
│   │   ├── ProfileScreen.js
│   │   └── FakeCallScreen.js
│   └── services/
│       └── api.js           # API service layer
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Expo CLI (`npm install -g expo-cli`)

### 1. Start Backend

```bash
cd backend
pip install fastapi uvicorn httpx python-multipart
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

### 2. Launch Web Dashboard

```bash
cd frontend-web
python -m http.server 3000
```

Open: `http://localhost:3000`

### 3. Run Mobile App

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone.

---

## 🗺️ Safe Route Finder

The route finder uses the **OSRM public routing API** with multi-modal support:

- 🚶 **Walking** — pedestrian-optimized paths
- 🚗 **Driving** — road network routing
- 🚲 **Cycling** — bike-friendly corridors

Safety scoring is based on:
- **Time of day** — night-time routes scored more conservatively
- **Populated areas** — routes through commercial/busy zones preferred
- **Route length vs direct distance** — penalizes unnecessarily long detours
- **Proximity to landmarks** — hospitals, police stations boost safety score

---

## 🆘 SOS Flow

```
User triggers SOS
      │
      ▼
GPS location captured
      │
      ▼
Emergency message composed with:
  - Live coordinates (Google Maps link)
  - Timestamp
  - User name & blood group
      │
      ▼
Dispatched via:
  - SMS (Twilio / fallback)
  - WhatsApp message link
  - Direct call to emergency contact
  - Police alert (Disha Helpline: 1091)
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login & get JWT token |
| `GET` | `/safe-route` | Get safe routes between two points |
| `GET` | `/geocode` | Geocode any Indian address/landmark |
| `GET` | `/police-stations` | Nearest police stations by coordinates |
| `POST` | `/sos/trigger` | Trigger emergency SOS |
| `POST` | `/chatbot` | AI chatbot query |
| `GET` | `/fake-call` | Generate a fake incoming call |

---

## 🇮🇳 India-Specific Features

- **Disha Helpline (1091)** — Women's safety hotline integrated
- **Police: 112** — Direct emergency dial
- **Default region:** Amaravati, Andhra Pradesh
- **Geocoding** works for any Indian city, district, road, or landmark
- **All 28 states + UTs** covered via OpenStreetMap data

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

**Siva Sathvik** — [@SivaSathvik6369](https://github.com/SivaSathvik6369)

> Built with ❤️ for women's safety across India 🇮🇳
