-- Create User Profile Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    blood_group VARCHAR(5),
    medical_conditions TEXT,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    priority INT DEFAULT 1, -- 1 = High, 2 = Medium, 3 = Low
    relationship VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create SOS Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, RESOLVED, FALSE_ALARM
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    audio_evidence_url VARCHAR(255),
    video_evidence_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create Incident Timeline Logs Table
CREATE TABLE IF NOT EXISTS incident_timeline (
    id SERIAL PRIMARY KEY,
    incident_id INT REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- SOS_ACTIVATED, GPS_UPDATE, SMS_SENT, CALL_INITIATED, RESPONSE_DISPATCHED
    description TEXT,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
