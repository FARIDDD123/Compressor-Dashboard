"""
Edge Gateway

Main gateway service for edge computing operations. Handles data ingestion,
processing (RTM, DVR), local storage, and synchronization with cloud.
"""

import logging
import time
import threading
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import sys
import requests

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from edge.config import (
    EDGE_DB_PATH,
    CLOUD_API_URL,
    CLOUD_SYNC_ENABLED,
    CLOUD_SYNC_INTERVAL,
    EDGE_MODE,
    EDGE_RTM_ENABLED,
    EDGE_DVR_ENABLED,
    EDGE_ALERTS_ENABLED,
    CLOUD_HEALTH_CHECK_INTERVAL,
    CLOUD_HEALTH_CHECK_TIMEOUT,
    EDGE_DATA_RETENTION_HOURS,
)
from edge.storage import LocalDatabase
from edge.processing import EdgeRTMProcessor, EdgeDVRProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EdgeGateway:
    """
    Edge Gateway for processing critical operations in disconnected scenarios.
    
    The gateway can operate in three modes:
    - online: Always connected to cloud
    - offline: Always operates offline
    - auto: Automatically switches between online/offline based on connectivity
    """

    def __init__(self):
        """Initialize the Edge Gateway."""
        # Storage
        self.db = LocalDatabase(EDGE_DB_PATH)
        
        # Processors
        self.rtm_processor = None
        self.dvr_processor = None
        
        if EDGE_RTM_ENABLED:
            try:
                self.rtm_processor = EdgeRTMProcessor()
                logger.info("✅ Edge RTM processor initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize RTM processor: {e}")

        if EDGE_DVR_ENABLED:
            try:
                self.dvr_processor = EdgeDVRProcessor()
                logger.info("✅ Edge DVR processor initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize DVR processor: {e}")

        # State
        self.cloud_connected = False
        self.mode = EDGE_MODE
        self.running = False
        self.last_sync_time = None
        self.previous_data = None  # For DVR rate-of-change checks

        # Threads
        self.sync_thread = None
        self.health_check_thread = None

    def start(self):
        """Start the edge gateway service."""
        if self.running:
            logger.warning("Edge Gateway is already running")
            return

        self.running = True
        logger.info("🚀 Starting Edge Gateway...")

        # Start health check thread
        if CLOUD_SYNC_ENABLED:
            self.health_check_thread = threading.Thread(
                target=self._health_check_loop,
                daemon=True
            )
            self.health_check_thread.start()

        # Start sync thread
        if CLOUD_SYNC_ENABLED and self.mode != "offline":
            self.sync_thread = threading.Thread(
                target=self._sync_loop,
                daemon=True
            )
            self.sync_thread.start()

        logger.info("✅ Edge Gateway started successfully")

    def stop(self):
        """Stop the edge gateway service."""
        if not self.running:
            return

        logger.info("🛑 Stopping Edge Gateway...")
        self.running = False

        # Wait for threads to finish
        if self.sync_thread:
            self.sync_thread.join(timeout=5)
        if self.health_check_thread:
            self.health_check_thread.join(timeout=5)

        self.db.close()
        logger.info("✅ Edge Gateway stopped")

    def process_sensor_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process incoming sensor data through RTM and DVR pipelines.

        Args:
            data: Dictionary containing sensor readings

        Returns:
            Dictionary containing processing results
        """
        if not self.running:
            logger.warning("Gateway not running, cannot process data")
            return {}

        result = {
            "processed": False,
            "validated": False,
            "anomaly_detected": False,
            "alerts": [],
            "local_storage_id": None,
        }

        try:
            # Step 1: Data Validation (DVR)
            validated_data = data.copy()
            if self.dvr_processor:
                is_valid, validation_errors, corrected_data = self.dvr_processor.validate(
                    data, self.previous_data
                )
                validated_data = corrected_data
                result["validated"] = is_valid

                if validation_errors:
                    logger.warning(f"Validation errors: {validation_errors}")
                    if EDGE_ALERTS_ENABLED:
                        # Create validation alert
                        alert_id = self.db.insert_alert(
                            alert_type="validation_error",
                            severity="warning",
                            message=f"Data validation errors: {', '.join(validation_errors)}",
                            metadata={"errors": validation_errors}
                        )
                        result["alerts"].append(alert_id)

            # Step 2: Real-Time Monitoring (RTM)
            if self.rtm_processor:
                is_anomaly, anomaly_score, metadata = self.rtm_processor.predict(validated_data)
                
                if is_anomaly:
                    result["anomaly_detected"] = True
                    logger.warning(f"Anomaly detected with score: {anomaly_score:.4f}")

                    if EDGE_ALERTS_ENABLED:
                        # Create anomaly alert
                        alert_id = self.db.insert_alert(
                            alert_type="anomaly",
                            severity="critical" if anomaly_score > 0.8 else "warning",
                            message=f"Anomaly detected: score={anomaly_score:.4f}",
                            metadata={
                                "anomaly_score": anomaly_score,
                                "metadata": metadata,
                            }
                        )
                        result["alerts"].append(alert_id)

            # Step 3: Store data locally
            sensor_data_id = self.db.insert_sensor_data(
                validated_data,
                validated=result["validated"]
            )
            result["local_storage_id"] = sensor_data_id

            # Update previous data for next validation
            self.previous_data = validated_data.copy()

            result["processed"] = True

        except Exception as e:
            logger.error(f"Error processing sensor data: {e}", exc_info=True)
            result["error"] = str(e)

        return result

    def _health_check_loop(self):
        """Continuously check cloud connectivity."""
        logger.info("Starting cloud health check loop")
        
        while self.running:
            try:
                self._check_cloud_connectivity()
            except Exception as e:
                logger.error(f"Error in health check: {e}")

            time.sleep(CLOUD_HEALTH_CHECK_INTERVAL)

    def _check_cloud_connectivity(self) -> bool:
        """
        Check if cloud is reachable.

        Returns:
            True if cloud is connected, False otherwise
        """
        try:
            response = requests.get(
                f"{CLOUD_API_URL}/health",
                timeout=CLOUD_HEALTH_CHECK_TIMEOUT
            )
            was_connected = self.cloud_connected
            self.cloud_connected = response.status_code == 200

            if was_connected != self.cloud_connected:
                status = "connected" if self.cloud_connected else "disconnected"
                logger.info(f"Cloud status changed: {status}")

            # Update edge status in database
            self.db.update_edge_status(
                cloud_connected=self.cloud_connected,
                mode=self.mode,
                last_sync=self.last_sync_time,
            )

            return self.cloud_connected

        except Exception as e:
            was_connected = self.cloud_connected
            self.cloud_connected = False
            
            if was_connected:
                logger.warning(f"Cloud connection lost: {e}")

            return False

    def _sync_loop(self):
        """Continuously sync data with cloud when connected."""
        logger.info("Starting cloud sync loop")

        while self.running:
            try:
                if self.cloud_connected or self.mode == "offline":
                    # Only sync when connected (unless in offline mode)
                    if self.cloud_connected:
                        self._sync_with_cloud()
                else:
                    logger.debug("Cloud not connected, skipping sync")

            except Exception as e:
                logger.error(f"Error in sync loop: {e}")

            time.sleep(CLOUD_SYNC_INTERVAL)

    def _sync_with_cloud(self):
        """Synchronize local data with cloud."""
        try:
            # Sync sensor data
            unsynced_data = self.db.get_unsynced_sensor_data(limit=100)
            if unsynced_data:
                logger.info(f"Syncing {len(unsynced_data)} sensor data records")

                # Send to cloud API
                # Note: This is a simplified implementation
                # In production, you would use proper API endpoints
                synced_ids = []
                for record in unsynced_data:
                    try:
                        # POST to cloud API
                        response = requests.post(
                            f"{CLOUD_API_URL}/api/edge/sensor-data",
                            json=record["data"],
                            timeout=10
                        )
                        if response.status_code == 200:
                            synced_ids.append(record["id"])
                    except Exception as e:
                        logger.error(f"Error syncing record {record['id']}: {e}")

                # Mark as synced
                if synced_ids:
                    self.db.mark_sensor_data_synced(synced_ids)
                    logger.info(f"Synced {len(synced_ids)} sensor data records")

            # Sync alerts
            unsynced_alerts = self.db.get_unsynced_alerts(limit=100)
            if unsynced_alerts:
                logger.info(f"Syncing {len(unsynced_alerts)} alerts")

                synced_ids = []
                for alert in unsynced_alerts:
                    try:
                        response = requests.post(
                            f"{CLOUD_API_URL}/api/edge/alerts",
                            json=alert,
                            timeout=10
                        )
                        if response.status_code == 200:
                            synced_ids.append(alert["id"])
                    except Exception as e:
                        logger.error(f"Error syncing alert {alert['id']}: {e}")

                if synced_ids:
                    self.db.mark_alerts_synced(synced_ids)
                    logger.info(f"Synced {len(synced_ids)} alerts")

            self.last_sync_time = datetime.utcnow()

            # Cleanup old data
            self.db.cleanup_old_data(EDGE_DATA_RETENTION_HOURS)

        except Exception as e:
            logger.error(f"Error during cloud sync: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Get gateway status information."""
        status = {
            "running": self.running,
            "mode": self.mode,
            "cloud_connected": self.cloud_connected,
            "last_sync": self.last_sync_time.isoformat() if self.last_sync_time else None,
            "rtm_enabled": self.rtm_processor is not None,
            "dvr_enabled": self.dvr_processor is not None,
        }

        if self.rtm_processor:
            status["rtm_status"] = self.rtm_processor.get_status()

        if self.dvr_processor:
            status["dvr_status"] = self.dvr_processor.get_status()

        return status


def main():
    """Main entry point for edge gateway service."""
    gateway = EdgeGateway()
    
    try:
        gateway.start()
        
        # Keep running
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
    finally:
        gateway.stop()


if __name__ == "__main__":
    main()

