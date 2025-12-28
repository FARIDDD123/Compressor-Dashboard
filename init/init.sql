-- init/init.sql

-- Create the application user with password from environment variable
-- NOTE: The actual password should be set in the .env file
-- This is a placeholder that will be replaced by docker-entrypoint
-- DO NOT commit real passwords to version control!
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'REPLACE_WITH_DB_PASSWORD_FROM_ENV';
GRANT ALL PRIVILEGES ON compressor_db.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Switch to the target database
USE compressor_db;

-- Create the main data table
CREATE TABLE IF NOT EXISTS compressor_data (
    `Time` INT PRIMARY KEY,
    `Device_ID` VARCHAR(20),
    `Pressure_In` FLOAT,
    `Temperature_In` FLOAT,
    `Flow_Rate` FLOAT,
    `Pressure_Out` FLOAT,
    `Temperature_Out` FLOAT,
    `Efficiency` FLOAT,
    `Power_Consumption` FLOAT,
    `Vibration` FLOAT,
    `Status` VARCHAR(50),
    `Frequency` FLOAT,
    `Amplitude` FLOAT,
    `Phase_Angle` FLOAT,
    `Mass` FLOAT,
    `Stiffness` FLOAT,
    `Damping` FLOAT,
    `Density` FLOAT,
    `Velocity` FLOAT,
    `Viscosity` FLOAT,
    `Ambient_Temperature` FLOAT,
    `Humidity` FLOAT,
    `Air_Pollution` FLOAT,
    `Fuel_Quality` FLOAT,
    `Load_Factor` FLOAT,
    `Maintenance_Quality` FLOAT,
    `vib_std` FLOAT,
    `vib_max` FLOAT,
    `vib_mean` FLOAT,
    `vib_min` FLOAT,
    `vib_rms` FLOAT
);
-- Add this at the end of init/init.sql

CREATE TABLE IF NOT EXISTS rul_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id VARCHAR(50) DEFAULT 'SGT-400-Main',
    rul_value FLOAT NOT NULL,
    confidence FLOAT,
    prediction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rto_suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suggestion_text VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prediction_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_version VARCHAR(50) NOT NULL,
    input_data TEXT,
    prediction_result TEXT,
    latency_ms FLOAT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS alarms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time_id INT,
    timestamp DATETIME NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    details TEXT,
    causes JSON NULL,
    urgency VARCHAR(50) DEFAULT 'Medium',
    acknowledged BOOLEAN DEFAULT FALSE,
    source_service VARCHAR(100) DEFAULT 'rtm_consumer'
);

-- Audit Trail Table (NF-512)
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(255) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    original_value TEXT NOT NULL,
    corrected_value TEXT NOT NULL,
    algorithm_id VARCHAR(100) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    reason TEXT NULL,
    user_id INT NULL,
    username VARCHAR(100) NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_record_id (record_id),
    INDEX idx_service (service_name),
    INDEX idx_timestamp (timestamp),
    INDEX idx_algorithm (algorithm_id)
) ENGINE=InnoDB;

-- Data Lineage Metadata Table (NF-511)
CREATE TABLE IF NOT EXISTS data_lineage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(255) NOT NULL,
    source_topic VARCHAR(100) NOT NULL,
    processing_service VARCHAR(100) NOT NULL,
    source_id VARCHAR(255) NULL,
    metadata JSON NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_record_id (record_id),
    INDEX idx_source (source_topic),
    INDEX idx_service (processing_service)
) ENGINE=InnoDB;

-- Authentication & Authorization Tables
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5fQ5QX4u', 'admin', TRUE),
('engineer', 'engineer@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5fQ5QX4u', 'engineer', TRUE),
('operator', 'operator@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5fQ5QX4u', 'operator', TRUE)
ON DUPLICATE KEY UPDATE username=username;