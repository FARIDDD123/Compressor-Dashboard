# backend/core/config.py

# --- Kafka Topics ---
KAFKA_RAW_TOPIC = "sensors-raw"
KAFKA_VALIDATED_TOPIC = "sensors-validated"
KAFKA_ALERTS_TOPIC = "alerts"
KAFKA_RTO_SUGGESTIONS_TOPIC = "rto-suggestions"

# --- Model Artifacts ---
RTM_MODEL_PATH = "artifacts/isolation_forest_model.onnx"
RTM_EXPLAIN_MODEL_PATH = "artifacts/rtm_random_forest.joblib"
RTM_SCALER_MEAN_PATH = "artifacts/rtm_scaler_mean.npy"
RTM_SCALER_SCALE_PATH = "artifacts/rtm_scaler_scale.npy"

RUL_MODEL_PATH = "artifacts/rul_model.onnx"
RUL_SCALER_PATH = "artifacts/rul_scaler.pkl"

RTO_MODEL_PATH = "artifacts/best_ppo_actor.onnx"
RTO_SCALER_PATH = "artifacts/rto_scaler.pkl"

# --- Feature Lists ---
RTM_FEATURE_COLUMNS = [
    "Pressure_In",
    "Temperature_In",
    "Flow_Rate",
    "Pressure_Out",
    "Temperature_Out",
    "Efficiency",
    "Power_Consumption",
    "Vibration",
    "Ambient_Temperature",
    "Humidity",
    "Air_Pollution",
    "Frequency",
    "Amplitude",
    "Phase_Angle",
    "Velocity",
    "Stiffness",
    "Vibration_roll_mean",
    "Power_Consumption_roll_mean",
    "Vibration_roll_std",
    "Power_Consumption_roll_std",
]

RUL_MODEL_FEATURES = [
    "Pressure_In",
    "Temperature_In",
    "Flow_Rate",
    "Pressure_Out",
    "Temperature_Out",
    "Efficiency",
    "Power_Consumption",
    "Vibration",
    "Ambient_Temperature",
    "Humidity",
    "Air_Pollution",
    "Startup_Shutdown_Cycles",
    "Maintenance_Quality",
    "Fuel_Quality",
    "Load_Factor",
    "Anomaly_IForest",
    "Anomaly_LOF",
    "Anomaly_DBSCAN",
    "Anomaly_Autoencoder",
    "Anomaly_Score",
    "Final_Anomaly",
    "Stiffness",
    "Frequency",
    "Damping",
    "Mass",
    "vib_std",
    "vib_max",
    "Amplitude",
    "Density",
    "vib_mean",
    "Velocity",
    "Viscosity",
    "Phase_Angle",
    "vib_min",
    "vib_rms",
    "Pressure_In_Filtered",
    "Temperature_In_Filtered",
    "Flow_Rate_Filtered",
    "Vibration_Filtered",
]

# --- Added RTO Feature List ---
RTO_STATE_FEATURES = [
    "Pressure_In",
    "Temperature_In",
    "Flow_Rate",
    "Pressure_Out",
    "Temperature_Out",
    "Efficiency",
    "Power_Consumption",
    "Vibration",
    "Ambient_Temperature",
    "Humidity",
    "Air_Pollution",
    "Fuel_Quality",
    "Load_Factor",
    "vib_std",
    "vib_max",
    "vib_mean",
    "vib_min",
    "vib_rms",
    "Velocity",
    "Viscosity",
    "Phase_Angle",
]


# --- NEW: RTO Safety Constraints (Hardware/Operational Limits) ---
# These constraints are used by rto_env to enforce safety during training.
RTO_CONSTRAINTS = {
    # Action Constraints (Limit the output of the Actor model)
    "LOAD_FACTOR_MIN": 0.20,
    "LOAD_FACTOR_MAX": 0.95,
    # Physical/Safety Limits (For applying penalties in the reward function)
    "MAX_VIBRATION_LIMIT": 1.5,  # Emergency shutdown limit (e.g., mm/s)
    "MAX_POWER_CONSUMPTION": 8000,  # Max allowed power (kW)
    "MIN_EFFICIENCY": 0.75,  # Minimum acceptable efficiency
}
