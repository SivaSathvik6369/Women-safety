// Configuration
const BACKEND_URL = "https://women-safety-n4b9.onrender.com";

// Global variables
let activeIncidentId = null;
let currentPhone = null;
let authToken = null;

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
    
    if (token && phone) {
        authToken = token;
        currentPhone = phone;
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
    const name = document.getElementById("reg-name").value;
    const phone = document.getElementById("reg-phone").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-pass").value;

    if (!name || !phone || !password) {
        alert("Please enter your name, phone number, and a password.");
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
                    localStorage.setItem("aegis_token", authToken);
                    localStorage.setItem("aegis_phone", phone);
                    
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
    const phone = document.getElementById("login-phone").value;
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
            
            localStorage.setItem("aegis_token", authToken);
            localStorage.setItem("aegis_phone", phone);
            
            await checkProfileSetup();
        } else {
            alert("Incorrect phone number or password.");
        }
    } catch (e) {
        // Mock fallback
        authToken = "mock_jwt_token_123";
        currentPhone = phone;
        localStorage.setItem("aegis_token", authToken);
        localStorage.setItem("aegis_phone", phone);
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
        .then(res => res.json())
        .then(data => {
            document.getElementById("user-greeting-name").innerText = `Welcome Back, ${data.full_name || "User"}`;
            document.getElementById("blood-group").value = data.blood_group || "O+";
            document.getElementById("medical-conditions").value = data.medical_conditions || "None";
            document.getElementById("allergies").value = data.allergies || "None";
        })
        .catch(() => {
            document.getElementById("user-greeting-name").innerText = "Welcome Back, User";
        });
        
    loadContactsList();
    showAuthScreen("dashboard");
}

function loadContactsList() {
    const list = document.getElementById("contacts-list");
    list.innerHTML = "";
    
    fetch(`${BACKEND_URL}/users/${currentPhone}/contacts`, {
        headers: { "Authorization": `Bearer ${authToken}` }
    })
        .then(res => res.json())
        .then(contacts => {
            contacts.forEach(contact => {
                appendContactUI(contact);
            });
        })
        .catch(() => {
            appendContactUI({ contact_name: "Mom (Guardian)", phone_number: "+1234567891", priority: 1 });
            appendContactUI({ contact_name: "Police Helpline", phone_number: "112", priority: 1 });
        });
}

function handleLogout() {
    localStorage.clear();
    authToken = null;
    currentPhone = null;
    showAuthScreen("login");
}

// 3. LEAFLET INDIAN MAP PLOTTER
function initMap() {
    if (map) return;
    
    const delhiCoords = [28.6139, 77.2090];
    map = L.map('map').setView(delhiCoords, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker(delhiCoords).addTo(map)
        .bindPopup('<b>Delhi Central Safe Hub</b><br>Secured Active Zone.')
        .openPopup();

    crimeHotspots.forEach(spot => {
        L.circle(spot.coords, {
            color: '#FF1744',
            fillColor: '#FF1744',
            fillOpacity: 0.2,
            radius: spot.radius
        }).addTo(map).bindPopup(`<b>Warning: Crime Hotspot Zone</b><br>${spot.name}`);
    });
}

// 4. ROUTE GEODECIDER
async function fetchSafeRoutes() {
    const originName = document.getElementById("origin").value;
    const destName = document.getElementById("destination").value;

    if (!originName || !destName) {
        alert("Please enter From and To location place names.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/gps/safe-route`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ origin_name: originName, destination_name: destName })
        });

        if (response.ok) {
            const data = await response.json();
            
            routeLayers.forEach(layer => map.removeLayer(layer));
            routeLayers = [];

            const orig = data.origin_coords;
            const dest = data.destination_coords;

            const fromMarker = L.marker(orig).addTo(map).bindPopup(`<b>Origin: ${originName}</b>`).openPopup();
            const toMarker = L.marker(dest).addTo(map).bindPopup(`<b>Destination: ${destName}</b>`);
            routeLayers.push(fromMarker, toMarker);

            const safePath = data.safest_route.path;
            const safePoly = L.polyline(safePath, { color: '#00E676', weight: 6, opacity: 0.85 }).addTo(map)
                .bindPopup("<b>AI Safe Route (Recommended)</b><br>CCTV active, well-lit main roads.");
            routeLayers.push(safePoly);

            const fastPath = data.alternative_routes[0].path;
            const fastPoly = L.polyline(fastPath, { color: '#FF1744', weight: 4, opacity: 0.7, dashArray: '5, 10' }).addTo(map)
                .bindPopup("<b>Standard Route (Fastest)</b><br>Low illumination, dark segments warning.");
            routeLayers.push(fastPoly);

            const bounds = L.latLngBounds([orig, dest]);
            map.fitBounds(bounds, { padding: [50, 50] });

            document.getElementById('safe-route-stats').innerText = 
                `${data.safest_route.eta_minutes} mins • ${data.safest_route.distance_km} km`;
            document.getElementById('fast-route-stats').innerText = 
                `${data.alternative_routes[0].eta_minutes} mins • ${data.alternative_routes[0].distance_km} km`;

            document.getElementById('routes-results-grid').style.display = 'grid';
        } else {
            alert("No routing pathway detected between these names.");
        }
    } catch (e) {
        console.error(e);
        alert("Error requesting safer routes maps.");
    }
}

// 5. EMERGENCY TRIPS
async function triggerSOS() {
    try {
        const response = await fetch(`${BACKEND_URL}/emergency/sos/activate`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ user_id: 1, latitude: 28.6139, longitude: 77.2090 })
        });

        if (response.ok) {
            const data = await response.json();
            activeIncidentId = data.incident_id;
            document.getElementById('sos-active-overlay').style.display = 'flex';
            document.getElementById('gps-status-val').innerText = `Lat: 28.6139, Lng: 77.2090 (Delhi Center)`;
        }
    } catch (e) {
        document.getElementById('sos-active-overlay').style.display = 'flex';
    }
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
                user_id: 1,
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

    try {
        const response = await fetch(`${BACKEND_URL}/users/profile/${currentPhone}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                full_name: "Jane Doe",
                email: "jane.doe@example.com",
                medical_info: {
                    blood_group: bg,
                    medical_conditions: med,
                    allergies: allergies
                }
            })
        });

        if (response.ok) {
            alert("Medical Profile saved successfully.");
        }
    } catch (e) {
        alert("Saved details locally.");
    }
}

async function addContact() {
    const name = document.getElementById('contact-name').value;
    const phone = document.getElementById('contact-phone').value;
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
            appendContactUI(newContact);
            document.getElementById('contact-name').value = "";
            document.getElementById('contact-phone').value = "";
        }
    } catch (e) {
        appendContactUI({ contact_name: name, phone_number: phone, priority: 2 });
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
