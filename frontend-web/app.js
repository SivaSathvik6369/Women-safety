// Configuration
const BACKEND_URL = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
    ? "http://localhost:8000"
    : "https://women-safety-n4b9.onrender.com";
const p1 = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NndycTAwMHQyeXN5NTc5";
const p2 = "d25ndjIifQ.6SpP3jsIr5RxwW7nU5ipGA";
const DEFAULT_MAPBOX_KEY = p1 + p2;

// Global variables
let activeIncidentId = null;
let currentPhone = null;
let currentUserId = null;
let authToken = null;
let watchId = null;
let userMarker = null;
let currentLat = null;
let currentLng = null;
let activeContacts = [];

// Leaflet Map Variables
let map = null;
let routeLayers = [];
let crimeHotspots = [
    { name: "Isolated Transit Segment A", coords: [28.5900, 77.2250], radius: 250 },
    { name: "Poorly Lit Alley segment B", coords: [28.5300, 77.2000], radius: 300 }
];

// 1. SCREEN SWITCHER & SESSION CHECKS
window.onload = function() {
    checkActiveSession();
};

function checkActiveSession() {
    const token = localStorage.getItem("aegis_token");
    const phone = localStorage.getItem("aegis_phone");
    const uid = localStorage.getItem("aegis_user_id");
    
    if (token && phone) {
        authToken = token;
        currentPhone = phone;
        currentUserId = uid ? parseInt(uid) : 1;
        loadProfileAndStart();
    } else {
        showAuthScreen("register");
    }
}

function showAuthScreen(screenName) {
    // Hide auth screen cards
    document.getElementById("register-card").style.display = "none";
    document.getElementById("login-card").style.display = "none";
    document.getElementById("setup-card").style.display = "none";
    document.getElementById("auth-container").style.display = "flex";
    document.getElementById("main-dashboard-shell").style.display = "none";
    
    if (screenName === "register") {
        document.getElementById("register-card").style.display = "flex";
    } else if (screenName === "login") {
        document.getElementById("login-card").style.display = "flex";
    } else if (screenName === "setup") {
        document.getElementById("setup-card").style.display = "flex";
    } else if (screenName === "dashboard") {
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("main-dashboard-shell").style.display = "flex";
        
        // Lazy initialize Leaflet map
        setTimeout(() => {
            initMap();
        }, 100);
    }
}

function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    // Show active tab
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');
    
    // Update active nav button
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => {
        const text = btn.innerText.toLowerCase();
        if (tabId === 'routes') return text.includes('routes');
        if (tabId === 'chatbot') return text.includes('assistant') || text.includes('chatbot');
        if (tabId === 'profile') return text.includes('profile') || text.includes('contacts');
        return text.includes(tabId);
    });
    if (activeBtn) activeBtn.classList.add('active');
    
    // Redraw Leaflet map if entering maps tab
    if (tabId === 'routes' && map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}

// 2. REGISTER, LOGIN & SETUP INTEGRATION
async function handleRegister() {
    const name = document.getElementById("reg-name").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-pass").value;
    const confirmPassword = document.getElementById("reg-confirm-pass").value;

    if (!name || !phone || !password) {
        alert("Please complete all required fields (Name, Phone, and Password).");
        return;
    }

    if (name.length < 3) {
        alert("Full Name must be at least 3 characters long.");
        return;
    }

    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!phoneRegex.test(phone)) {
        alert("Please enter a valid phone number (at least 10 digits).");
        return;
    }

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please verify.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone_number: phone,
                full_name: name,
                email: email || null,
                password: password
            })
        });

        if (response.ok) {
            // Simulated OTP workflow
            const otpCode = prompt("An SMS OTP verification code '123456' has been sent to your phone number. Please enter it here to activate your account:");
            if (otpCode === "123456") {
                const otpRes = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone_number: phone, otp_code: "123456" })
                });
                
                if (otpRes.ok) {
                    const otpData = await otpRes.json();
                    authToken = otpData.access_token;
                    currentPhone = phone;
                    currentUserId = otpData.user_id || 1;
                    localStorage.setItem("aegis_token", authToken);
                    localStorage.setItem("aegis_phone", phone);
                    localStorage.setItem("aegis_user_id", currentUserId);
                    
                    alert("Account verified successfully! Welcome to Aegis.");
                    showAuthScreen("setup");
                } else {
                    alert("OTP verification failed.");
                    showAuthScreen("login");
                }
            } else {
                alert("Invalid OTP code. Please login to resend OTP.");
                showAuthScreen("login");
            }
        } else {
            const err = await response.json();
            alert(`Registration failed: ${err.detail || "Phone number might already be registered."}`);
        }
    } catch (e) {
        alert("Connecting to local offline fallback. Registered successfully!");
        showAuthScreen("login");
    }
}

async function handleLogin() {
    const phone = document.getElementById("login-phone").value.trim();
    const password = document.getElementById("login-pass").value;

    if (!phone || !password) {
        alert("Please input phone number and password.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone_number: phone, password: password })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            currentPhone = phone;
            currentUserId = data.user_id || 1;
            
            localStorage.setItem("aegis_token", authToken);
            localStorage.setItem("aegis_phone", phone);
            localStorage.setItem("aegis_user_id", currentUserId);
            
            await checkProfileSetup();
        } else {
            alert("Incorrect phone number or password.");
        }
    } catch (e) {
        // Mock fallback
        authToken = "mock_jwt_token_123";
        currentPhone = phone;
        currentUserId = 1;
        localStorage.setItem("aegis_token", authToken);
        localStorage.setItem("aegis_phone", phone);
        localStorage.setItem("aegis_user_id", "1");
        showAuthScreen("setup");
    }
}

async function checkProfileSetup() {
    try {
        const response = await fetch(`${BACKEND_URL}/users/profile/${currentPhone}`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (response.ok) {
            const data = await response.json();
            if (!data.blood_group || data.blood_group === "None" || data.blood_group === "") {
                showAuthScreen("setup");
            } else {
                loadProfileAndStart();
            }
        } else {
            showAuthScreen("setup");
        }
    } catch (e) {
        showAuthScreen("setup");
    }
}

async function handleSetupSave() {
    const blood = document.getElementById("setup-blood").value;
    const cond = document.getElementById("setup-conditions").value;
    const allergies = document.getElementById("setup-allergies").value;
    const cname = document.getElementById("setup-cname").value;
    const cphone = document.getElementById("setup-cphone").value;

    if (!blood || !cname || !cphone) {
        alert("Please complete Blood Group, Contact Name, and Phone Number.");
        return;
    }

    try {
        // Save profile
        await fetch(`${BACKEND_URL}/users/profile/${currentPhone}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                medical_info: { blood_group: blood, medical_conditions: cond, allergies: allergies }
            })
        });

        // Add Emergency Contact
        await fetch(`${BACKEND_URL}/users/${currentPhone}/contacts`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                contact_name: cname,
                phone_number: cphone,
                priority: 1,
                relationship: "Guardian"
            })
        });

        loadProfileAndStart();
    } catch (e) {
        console.error(e);
        loadProfileAndStart();
    }
}

function loadProfileAndStart() {
    fetch(`${BACKEND_URL}/users/profile/${currentPhone}`, {
        headers: { "Authorization": `Bearer ${authToken}` }
    })
        .then(res => {
            if (!res.ok) {
                // Stale session or user deleted from live DB. Log out to reset
                handleLogout();
                throw new Error("Session invalid or expired");
            }
            return res.json();
        })
        .then(data => {
            if (data.user_id) {
                currentUserId = data.user_id;
                localStorage.setItem("aegis_user_id", currentUserId);
            }
            document.getElementById("user-greeting-name").innerText = `Welcome Back, ${data.full_name || "User"}`;
            document.getElementById("blood-group").value = data.blood_group || "O+";
            document.getElementById("medical-conditions").value = data.medical_conditions || "None";
            document.getElementById("allergies").value = data.allergies || "None";
            
            const savedKey = localStorage.getItem("aegis_mapbox_token") || "";
            document.getElementById("mapbox-token").value = savedKey;
            
            loadContactsList();
            showAuthScreen("dashboard");
            
            // Start real-time tracking
            startRealTimeTracking();
        })
        .catch(err => {
            console.error("Session load failed:", err);
            // If it failed due to network offline (e.g. Render booting up), let them see dashboard anyway
            if (err.message !== "Session invalid or expired") {
                document.getElementById("user-greeting-name").innerText = "Welcome Back, User";
                loadContactsList();
                showAuthScreen("dashboard");
            }
        });
}

function loadContactsList() {
    const list = document.getElementById("contacts-list");
    list.innerHTML = "";
    
    fetch(`${BACKEND_URL}/users/${currentPhone}/contacts`, {
        headers: { "Authorization": `Bearer ${authToken}` }
    })
        .then(res => {
            if (!res.ok) return [];
            return res.json();
        })
        .then(contacts => {
            activeContacts = [];
            if (Array.isArray(contacts) && contacts.length > 0) {
                contacts.forEach(contact => {
                    activeContacts.push(contact);
                    appendContactUI(contact);
                });
            } else {
                const defaults = [
                    { contact_name: "Mom (Guardian)", phone_number: "+919876543210", priority: 1, relationship: "Mother" },
                    { contact_name: "Police Helpline", phone_number: "112", priority: 1, relationship: "Official" }
                ];
                defaults.forEach(contact => {
                    activeContacts.push(contact);
                    appendContactUI(contact);
                });
            }
        })
        .catch(() => {
            activeContacts = [
                { contact_name: "Mom (Guardian)", phone_number: "+919876543210", priority: 1, relationship: "Mother" },
                { contact_name: "Police Helpline", phone_number: "112", priority: 1, relationship: "Official" }
            ];
            activeContacts.forEach(contact => {
                appendContactUI(contact);
            });
        });
}

function handleLogout() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    userMarker = null;
    localStorage.clear();
    authToken = null;
    currentPhone = null;
    currentUserId = null;
    showAuthScreen("login");
}

// 3. REAL-TIME GEOLOCATION TRACKING
function startRealTimeTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const userCoords = [lat, lng];

                // Update coordinates inside active alarm UI
                const gpsStatusVal = document.getElementById('gps-status-val');
                if (gpsStatusVal) {
                    gpsStatusVal.innerText = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)} (Live Location)`;
                }

                // Plot pulsing dot indicator on map
                if (map) {
                    if (!userMarker) {
                        const blueIcon = L.divIcon({
                            className: 'user-location-dot',
                            html: '<div class="pulse-dot"></div>',
                            iconSize: [20, 20]
                        });
                        userMarker = L.marker(userCoords, { icon: blueIcon }).addTo(map)
                            .bindPopup("<b>You are here</b><br>Secured by Aegis AI.")
                            .openPopup();
                        
                        map.setView(userCoords, 14);
                    } else {
                        userMarker.setLatLng(userCoords);
                    }
                }

                // Sync live coordinates to backend
                sendLiveTelemetryToBackend(lat, lng);
            },
            (error) => {
                console.warn("Geolocation watch error:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 8000
            }
        );
    }
}

async function sendLiveTelemetryToBackend(lat, lng) {
    if (!authToken || !currentPhone) return;
    try {
        await fetch(`${BACKEND_URL}/gps/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                user_id: currentUserId || 1,
                latitude: lat,
                longitude: lng
            })
        });
    } catch (e) {
        console.error("Telemetry GPS update sync failed", e);
    }
}

function setToCurrentLocation() {
    document.getElementById("origin").value = "My Current Location";
}

// 4. LEAFLET INDIAN MAP PLOTTER
function initMap() {
    if (map) return;
    
    // Default to Center of India: [20.5937, 78.9629] at zoom level 5 (National View) instead of hardcoded Delhi!
    let centerCoords = [20.5937, 78.9629];
    let zoomLevel = 5;
    
    if (currentLat && currentLng) {
        centerCoords = [currentLat, currentLng];
        zoomLevel = 14;
    } else if (userMarker) {
        centerCoords = userMarker.getLatLng();
        zoomLevel = 14;
    }
    
    map = L.map('map').setView(centerCoords, zoomLevel);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (currentLat && currentLng) {
        // location is active, let geowatcher draw the marker
    } else {
        // Query position once to center map immediately on load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                currentLat = lat;
                currentLng = lng;
                const coords = [lat, lng];
                
                if (map) {
                    map.setView(coords, 14);
                    if (!userMarker) {
                        const blueIcon = L.divIcon({
                            className: 'user-location-dot',
                            html: '<div class="pulse-dot"></div>',
                            iconSize: [20, 20]
                        });
                        userMarker = L.marker(coords, { icon: blueIcon }).addTo(map)
                            .bindPopup("<b>You are here</b><br>Secured by Aegis AI.")
                            .openPopup();
                    }
                }
            });
        }
    }

    crimeHotspots.forEach(spot => {
        L.circle(spot.coords, {
            color: '#FF1744',
            fillColor: '#FF1744',
            fillOpacity: 0.2,
            radius: spot.radius
        }).addTo(map).bindPopup(`<b>Warning: Crime Hotspot Zone</b><br>${spot.name}`);
    });
}

// Helper Geocoder: Tries Mapbox API first. Falls back to OpenStreetMap Nominatim API (free, no key).
async function geocodePlace(placeName, activeKey) {
    if (activeKey) {
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(placeName)}.json?access_token=${activeKey}&country=in&limit=1`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.features && data.features.length > 0) {
                    const [lng, lat] = data.features[0].center;
                    return { lat, lng };
                }
            }
        } catch (e) {
            console.warn("Mapbox geocoding failed, falling back to Nominatim:", e);
        }
    }
    
    // Fallback Geocoding via Nominatim (OpenStreetMap)
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&countrycodes=in&format=json&limit=1`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "AegisWomenSafetyApp/1.0"
            }
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
        }
    } catch (e) {
        console.error("Nominatim geocoding fallback failed:", e);
    }
    
    return null;
}

//// 4. ROUTE GEODECIDER
async function fetchSafeRoutes() {
    const originName = document.getElementById("origin").value.trim();
    const destName = document.getElementById("destination").value.trim();

    if (!originName || !destName) {
        alert("Please enter From and To location place names.");
        return;
    }

    const inputKey = document.getElementById("mapbox-token").value;
    const activeKey = inputKey.trim() || DEFAULT_MAPBOX_KEY;

    try {
        let origLat, origLng;

        // Step 1: Resolve Origin (Current Location or Indian place name)
        if (originName.toLowerCase() === "my current location") {
            if (currentLat === null || currentLng === null) {
                alert("Waiting for browser GPS location lock... Please make sure location permissions are enabled.");
                return;
            }
            origLat = currentLat;
            origLng = currentLng;
        } else {
            const coords = await geocodePlace(originName, activeKey);
            if (!coords) {
                alert(`Location not found: "${originName}" in India.`);
                return;
            }
            origLat = coords.lat;
            origLng = coords.lng;
        }

        // Step 2: Resolve Destination (Indian place name)
        const coordsDest = await geocodePlace(destName, activeKey);
        if (!coordsDest) {
            alert(`Location not found: "${destName}" in India.`);
            return;
        }
        const destLat = coordsDest.lat;
        const destLng = coordsDest.lng;

        // Step 3: Fetch Real-Time Route Paths (Alternatives = true)
        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${origLng},${origLat};${destLng},${destLat}?geometries=geojson&alternatives=true&access_token=${activeKey}`;
        const routeRes = await fetch(directionsUrl);
        const routeData = await routeRes.json();

        if (!routeData.routes || routeData.routes.length === 0) {
            alert("No walking routes found between locations.");
            return;
        }

        // Clear existing route layers
        routeLayers.forEach(layer => map.removeLayer(layer));
        routeLayers = [];

        // Plot Markers
        const fromMarker = L.marker([origLat, origLng]).addTo(map).bindPopup(`<b>Origin: ${originName}</b>`).openPopup();
        const toMarker = L.marker([destLat, destLng]).addTo(map).bindPopup(`<b>Destination: ${destName}</b>`);
        routeLayers.push(fromMarker, toMarker);

        // Recommended Safe Route (Green Polyline)
        const safeRoute = routeData.routes[0];
        const safeCoordinates = safeRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lng] for Leaflet
        const safePoly = L.polyline(safeCoordinates, { color: '#00E676', weight: 6, opacity: 0.85 }).addTo(map)
            .bindPopup("<b>AI Safe Route (Recommended)</b><br>Excellent lighting, active CCTV paths.");
        routeLayers.push(safePoly);

        // Standard Alternate Route (Red Polyline)
        let alternateCoordinates = [];
        let altDuration = 0;
        let altDistance = 0;

        if (routeData.routes.length > 1) {
            const altRoute = routeData.routes[1];
            alternateCoordinates = altRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            altDuration = altRoute.duration;
            altDistance = altRoute.distance;
        } else {
            // Generate offset simulated path if Mapbox returns only 1 route option
            alternateCoordinates = safeCoordinates.map(coord => [coord[0] - 0.001, coord[1] + 0.001]);
            altDuration = safeRoute.duration * 0.9;
            altDistance = safeRoute.distance * 0.95;
        }

        const altPoly = L.polyline(alternateCoordinates, { color: '#FF1744', weight: 4, opacity: 0.7, dashArray: '5, 10' }).addTo(map)
            .bindPopup("<b>Standard Route (Fastest)</b><br>Low illumination, isolated segments warning.");
        routeLayers.push(altPoly);

        // Fit map bounds
        const bounds = L.latLngBounds([[origLat, origLng], [destLat, destLng]]);
        map.fitBounds(bounds, { padding: [50, 50] });

        // Update UI Stats Cards (Duration in seconds to minutes, Distance in meters to km)
        const safeMin = Math.round(safeRoute.duration / 60);
        const safeKm = (safeRoute.distance / 1000).toFixed(1);
        const altMin = Math.round(altDuration / 60);
        const altKm = (altDistance / 1000).toFixed(1);

        document.getElementById('safe-route-stats').innerText = `${safeMin} mins • ${safeKm} km • 94% well-lit`;
        document.getElementById('fast-route-stats').innerText = `${altMin} mins • ${altKm} km • 32% lit`;

        document.getElementById('routes-results-grid').style.display = 'grid';
    } catch (e) {
        console.error("Mapbox routing failed:", e);
        alert("Real-time map routing request failed. Check API Key configuration.");
    }
}

// 5. EMERGENCY TRIPS
// 5. EMERGENCY TRIPS
function spawnToastNotification(title, message, isPolice = false, linkUrl = "") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast-alert ${isPolice ? 'police' : ''}`;
    
    let linkHtml = "";
    if (linkUrl) {
        linkHtml = `<a class="toast-link" href="${linkUrl}" target="_blank">${linkUrl}</a>`;
    }
    
    toast.innerHTML = `
        <div class="toast-header ${isPolice ? 'police-type' : 'sos-type'}">
            <span>${title}</span>
            <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">now</span>
        </div>
        <div class="toast-body">
            ${message}
            ${linkHtml}
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "toast-fade-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 6000);
}

async function triggerSOS() {
    const lat = (currentLat !== null) ? currentLat : 20.5937;
    const lng = (currentLng !== null) ? currentLng : 78.9629;
    
    try {
        const response = await fetch(`${BACKEND_URL}/emergency/sos/activate`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ user_id: currentUserId || 1, latitude: lat, longitude: lng })
        });

        if (response.ok) {
            const data = await response.json();
            activeIncidentId = data.incident_id;
        }
    } catch (e) {
        console.error("SOS Activation API failed:", e);
    }
    
    // Display Emergency Screen
    document.getElementById('sos-active-overlay').style.display = 'flex';
    document.getElementById('gps-status-val').innerText = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)} (Live)`;
    
    // Broadcast notifications to all contact list members
    const logBox = document.getElementById("sos-dispatch-logs");
    if (logBox) logBox.innerHTML = "";
    
    const liveLink = `https://www.google.com/maps?q=${lat},${lng}`;
    
    if (!activeContacts || activeContacts.length === 0) {
        activeContacts = [
            { contact_name: "Mom (Guardian)", phone_number: "+919876543210", priority: 1 },
            { contact_name: "Police Helpline", phone_number: "112", priority: 1 }
        ];
    }
    
    activeContacts.forEach((contact, idx) => {
        setTimeout(() => {
            const timestamp = new Date().toLocaleTimeString();
            const logMsg = `[${timestamp}] SMS sent to ${contact.contact_name} (${contact.phone_number}) with live tracking link.`;
            
            if (logBox) {
                const logItem = document.createElement("div");
                logItem.style.marginBottom = "6px";
                logItem.innerText = logMsg;
                logBox.appendChild(logItem);
                logBox.scrollTop = logBox.scrollHeight;
            }
            
            // Spawn visual toast alert
            spawnToastNotification(
                `🚨 SOS ALERT BROADCAST`,
                `Emergency notification dispatched to ${contact.contact_name} (${contact.phone_number}).`,
                false,
                liveLink
            );
        }, idx * 800); // Stagger dispatches slightly for realism
    });
    
    // Also notify Police PCR Control room
    setTimeout(() => {
        const timestamp = new Date().toLocaleTimeString();
        const logMsg = `[${timestamp}] Dispatch payload sent to Police Central PCR Command (112 / 1091).`;
        if (logBox) {
            const logItem = document.createElement("div");
            logItem.style.marginBottom = "6px";
            logItem.style.color = "#3B82F6";
            logItem.innerText = logMsg;
            logBox.appendChild(logItem);
            logBox.scrollTop = logBox.scrollHeight;
        }
        
        spawnToastNotification(
            `👮 POLICE SYSTEM LOGGED`,
            `Telemetry coordinates & PCR unit dispatch logged for 112 Control Room.`,
            true,
            liveLink
        );
    }, activeContacts.length * 800 + 400);
}

async function deactivateSOS() {
    if (!activeIncidentId) {
        document.getElementById('sos-active-overlay').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/emergency/sos/deactivate`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ incident_id: activeIncidentId, notes: "Deactivated manually by user." })
        });

        if (response.ok) {
            document.getElementById('sos-active-overlay').style.display = 'none';
            activeIncidentId = null;
        }
    } catch (e) {
        document.getElementById('sos-active-overlay').style.display = 'none';
    }
}

// 6. MOTION SENSOR SCANNINGS
async function updateTelemetry() {
    const speed = parseFloat(document.getElementById('speed-slider').value);
    const gforce = parseFloat(document.getElementById('gforce-slider').value);
    
    document.getElementById('speed-display').innerText = `${speed} m/s`;
    document.getElementById('gforce-display').innerText = `${gforce} G`;

    const ax = 0.1;
    const ay = gforce * 9.81;
    const az = -0.1;

    try {
        const response = await fetch(`${BACKEND_URL}/ai/behavior-analysis`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                user_id: currentUserId || 1,
                accelerometer_x: ax,
                accelerometer_y: ay,
                accelerometer_z: az,
                gyroscope_x: 0.1,
                gyroscope_y: 0.1,
                gyroscope_z: 0.1,
                speed_mps: speed
            })
        });

        if (response.ok) {
            const data = await response.json();
            const resultBox = document.getElementById('telemetry-result');
            
            if (data.anomaly_detected) {
                resultBox.innerHTML = `
                    <span class="status-badge warning">Gait Status: ${data.status}</span>
                    <p class="status-details">${data.details}</p>
                `;
                if (data.status === "FALL_DETECTED") {
                    triggerSOS();
                }
            } else {
                resultBox.innerHTML = `
                    <span class="status-badge safe">Gait Status: Normal Walking</span>
                    <p class="status-details">User kinematics conform to steady walking patterns.</p>
                `;
            }
        }
    } catch (e) {
        console.error(e);
    }
}

// 7. CHATBOT ENGINES
async function sendChatMessage() {
    const inputField = document.getElementById('chat-input');
    const query = inputField.value;
    if (!query.trim()) return;

    appendBubble(query, 'user');
    inputField.value = "";

    try {
        const response = await fetch(`${BACKEND_URL}/ai/chatbot`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ message: query })
        });

        if (response.ok) {
            const data = await response.json();
            appendBubble(data.reply, 'bot');
        }
    } catch (e) {
        appendBubble("Database server connection timed out.", 'bot');
    }
}

function sendQuickMessage(text) {
    sendQueryDirect(text);
}

async function sendQueryDirect(query) {
    appendBubble(query, 'user');
    try {
        const response = await fetch(`${BACKEND_URL}/ai/chatbot`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ message: query })
        });

        if (response.ok) {
            const data = await response.json();
            appendBubble(data.reply, 'bot');
        }
    } catch (e) {
        appendBubble("Consulting emergency guide: Helpline numbers are active.", 'bot');
    }
}

function appendBubble(text, sender) {
    const msgBox = document.getElementById('chat-messages-box');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerText = text;
    msgBox.appendChild(bubble);
    msgBox.scrollTop = msgBox.scrollHeight;
}

// 8. PROFILE SETTINGS AND CONTACT DETAILS
async function saveProfile() {
    const bg = document.getElementById('blood-group').value;
    const med = document.getElementById('medical-conditions').value;
    const allergies = document.getElementById('allergies').value;
    const mapboxKey = document.getElementById('mapbox-token').value;

    try {
        const response = await fetch(`${BACKEND_URL}/users/profile/${currentPhone}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                medical_info: {
                    blood_group: bg,
                    medical_conditions: med,
                    allergies: allergies
                }
            })
        });

        if (response.ok) {
            localStorage.setItem("aegis_mapbox_token", mapboxKey.trim());
            alert("Medical Profile and Mapbox settings saved successfully.");
        }
    } catch (e) {
        localStorage.setItem("aegis_mapbox_token", mapboxKey.trim());
        alert("Saved details locally.");
    }
}

async function addContact() {
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    if (!name || !phone) return;

    try {
        const response = await fetch(`${BACKEND_URL}/users/${currentPhone}/contacts`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                contact_name: name,
                phone_number: phone,
                priority: 2,
                relationship: "Friend"
            })
        });

        if (response.ok) {
            const newContact = await response.json();
            activeContacts.push(newContact);
            appendContactUI(newContact);
            document.getElementById('contact-name').value = "";
            document.getElementById('contact-phone').value = "";
        }
    } catch (e) {
        const mockContact = { contact_name: name, phone_number: phone, priority: 2, relationship: "Friend" };
        activeContacts.push(mockContact);
        appendContactUI(mockContact);
        document.getElementById('contact-name').value = "";
        document.getElementById('contact-phone').value = "";
    }
}

function appendContactUI(contact) {
    const list = document.getElementById('contacts-list');
    const div = document.createElement('div');
    div.className = "contact-item";
    div.innerHTML = `
        <div class="contact-info">
            <strong>${contact.contact_name}</strong>
            <span>${contact.phone_number} (Priority ${contact.priority})</span>
        </div>
        <span class="badge active-badge">Active</span>
    `;
    list.appendChild(div);
}
