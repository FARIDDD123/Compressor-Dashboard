import os
import logging
import json
import uuid
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from backend.core import config

# Only import eventlet and socketio if not in testing mode
is_testing = os.getenv("TESTING", "false").lower() == "true"

if not is_testing:
    import eventlet
    from flask_socketio import SocketIO
    from kafka import KafkaConsumer
    from kafka.errors import NoBrokersAvailable
    eventlet.monkey_patch()
else:
    # Mock for testing
    SocketIO = None
    KafkaConsumer = None
    NoBrokersAvailable = Exception

# Import blueprints
from .routes.auth_routes import auth_bp
from .routes.data_routes import data_bp
from .routes.prediction_routes import prediction_bp
from .routes.overview_routes import overview_bp
from .routes.pdm_routes import pdm_bp
from .routes.rto_routes import rto_bp
from .routes.mlops_routes import mlops_bp
from .routes.control_routes import control_bp
from .routes.analysis_routes import analysis_bp
from .routes.governance_routes import governance_bp
from .routes.wireless_routes import wireless_bp, init_wireless_routes
from .routes.edge_routes import edge_bp


# --- New Function: Listen to Processed Data (All Sensors) ---
def kafka_processed_data_listener():
    """Listens to the 'sensors-processed' topic (from RTM Consumer) and pushes messages to clients."""
    if is_testing:
        return
    consumer = None
    PROCESSED_DATA_TOPIC = "sensors-processed"

    logging.info(f"Starting Kafka listener for {PROCESSED_DATA_TOPIC} stream...")
    while not consumer:
        try:
            random_group_id = f"backend-processed-{uuid.uuid4()}"
            consumer = KafkaConsumer(
                PROCESSED_DATA_TOPIC,
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="latest",  # Start consuming from the newest messages
                group_id=random_group_id,
            )
            logging.info(
                f"✅ Processed data WebSocket bridge connected to '{PROCESSED_DATA_TOPIC}' with group_id: {random_group_id}"
            )
        except NoBrokersAvailable:
            logging.warning(
                "Processed data bridge could not connect to Kafka. Retrying in 5 seconds..."
            )
            if not is_testing:
                eventlet.sleep(5)
            else:
                import time
                time.sleep(5)

    for message in consumer:
        try:
            processed_data = message.value
            # Use logging.debug to reduce verbosity, as this will be frequent
            logging.debug(
                f"Received processed data (Time={processed_data.get('Time')}). Emitting to frontend..."
            )
            # The 'new_data' event will now be sourced from processed data
            socketio.emit("new_data", processed_data)
        except Exception as e:
            logging.error(f"Error processing processed data message: {e}")


# The original kafka_raw_data_listener is removed/replaced.
# The kafka_alert_listener remains unchanged.
def kafka_alert_listener():
    """Listens to the 'alerts' topic and pushes messages to clients via WebSocket."""
    if is_testing:
        return
    consumer = None
    logging.info("Starting Kafka listener for WebSocket bridge...")
    while not consumer:
        try:
            random_group_id = f"backend-alert-{uuid.uuid4()}"
            consumer = KafkaConsumer(
                "alerts",
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="earliest",
                group_id=random_group_id,
            )
            logging.info(
                f"✅ WebSocket bridge connected to 'alerts' topic with group_id: {random_group_id}"
            )
        except NoBrokersAvailable:
            logging.warning(
                "WebSocket bridge could not connect to Kafka. Retrying in 5 seconds..."
            )
            if not is_testing:
                eventlet.sleep(5)
            else:
                import time
                time.sleep(5)

    for message in consumer:
        try:
            alert_data = message.value
            logging.info(f"Received alert: {alert_data}. Emitting to frontend...")
            socketio.emit("new_alert", alert_data)
        except Exception as e:
            logging.error(f"Error processing alert message: {e}")


# The rto_suggestion_listener remains unchanged.
def rto_suggestion_listener():
    """Listens to the RTO suggestions topic and pushes them to clients."""
    if is_testing:
        return
    consumer = None
    logging.info("Starting Kafka listener for RTO suggestions...")
    while not consumer:
        try:
            random_group_id = f"backend-rto-{uuid.uuid4()}"
            consumer = KafkaConsumer(
                config.KAFKA_RTO_SUGGESTIONS_TOPIC,
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="latest",
                group_id=random_group_id,
            )
            logging.info("✅ WebSocket bridge connected to RTO suggestions topic.")
        except NoBrokersAvailable:
            logging.warning("RTO bridge could not connect to Kafka. Retrying...")
            if not is_testing:
                eventlet.sleep(5)
            else:
                import time
                time.sleep(5)

    for message in consumer:
        try:
            suggestion_data = message.value
            logging.info(
                f"Received RTO suggestion: {suggestion_data}. Emitting to frontend..."
            )
            # The event name 'new_rto_suggestion' is important for the frontend
            socketio.emit("new_rto_suggestion", suggestion_data)
        except Exception as e:
            logging.error(f"Error processing RTO suggestion message: {e}")


def create_app():
    app = Flask(__name__)
    
    # Check if we're in testing mode (already defined at module level)
    # is_testing is already set at module level
    
    # CORS Configuration with proper security
    allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    CORS(app, 
         resources={r"/api/*": {"origins": allowed_origins}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    load_dotenv()
    logging.basicConfig(
        level=logging.INFO if not is_testing else logging.WARNING,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    # Configuration loading
    app.config["DB_CONFIG"] = {
        "host": os.getenv("DB_HOST"),
        "port": int(os.getenv("DB_PORT", 3306)),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE"),
    }
    app.config["INFLUXDB_URL"] = os.getenv("INFLUXDB_URL")
    app.config["INFLUXDB_TOKEN"] = os.getenv("INFLUXDB_TOKEN")
    app.config["INFLUXDB_ORG"] = os.getenv("INFLUXDB_ORG")
    app.config["INFLUXDB_BUCKET"] = os.getenv("INFLUXDB_BUCKET")

    if not is_testing:
        logging.info("Pre-loading machine learning models...")
        logging.info("✅ All models loaded successfully.")

    # Start Prometheus metrics server (skip in testing)
    if not is_testing:
        try:
            from backend.core.metrics import start_metrics_server
            start_metrics_server(port=8000)
        except Exception as e:
            logging.warning(f"Could not start metrics server: {e}")

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(data_bp, url_prefix="/api/data")
    app.register_blueprint(prediction_bp, url_prefix="/api/predict")
    app.register_blueprint(overview_bp, url_prefix="/api/status")
    app.register_blueprint(pdm_bp, url_prefix="/api/predict")
    app.register_blueprint(rto_bp, url_prefix="/api/rto")
    app.register_blueprint(mlops_bp, url_prefix="/api/models")
    app.register_blueprint(control_bp, url_prefix="/api/control")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    app.register_blueprint(governance_bp, url_prefix="/api/governance")
    app.register_blueprint(edge_bp)  # Edge routes already have /api/edge prefix
    app.register_blueprint(wireless_bp)  # Wireless protocol routes
    
    # Initialize wireless protocol routes
    init_wireless_routes(app)

    @app.route("/")
    def home():
        return jsonify({"message": "Compressor Digital Twin Gas Turbine 1 API is running."})
    
    @app.route("/health")
    def health():
        """Health check endpoint."""
        return jsonify({"status": "healthy"}), 200

    return app


# --- Initialize App and SocketIO ---
app = create_app()

# Only initialize SocketIO and Kafka listeners if not in testing mode
if not is_testing and SocketIO:
    import eventlet  # Import here to ensure it's available
    socketio = SocketIO(
        app, cors_allowed_origins="http://localhost:5173", async_mode="eventlet"
    )
    
    # Start Kafka listeners as background tasks
    eventlet.spawn(kafka_alert_listener)
    # Replace kafka_raw_data_listener with the new processed data listener
    eventlet.spawn(kafka_processed_data_listener)
    eventlet.spawn(rto_suggestion_listener)
else:
    # Create a mock socketio for testing
    socketio = None

# Gunicorn uses the 'app' object, so the __main__ block is for direct execution
if __name__ == "__main__":
    if os.getenv("TESTING", "false").lower() != "true":
        port = int(os.getenv("PORT", 5000))
        logging.info(f"Starting direct execution SocketIO server on port {port}...")
        if socketio:
            socketio.run(app, host="0.0.0.0", port=port)
    else:
        logging.info("Running in test mode - skipping SocketIO server start")
