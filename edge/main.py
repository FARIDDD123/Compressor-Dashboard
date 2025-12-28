"""
Edge Computing Main Service

Main entry point for the Edge Computing service that can run independently
or be integrated into the main system.
"""

import logging
import signal
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from edge.gateway import EdgeGateway
from edge.config import EDGE_LOG_LEVEL, EDGE_LOG_FILE

# Configure logging
logging.basicConfig(
    level=getattr(logging, EDGE_LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(EDGE_LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


def signal_handler(sig, frame):
    """Handle shutdown signals."""
    logger.info("Received shutdown signal")
    if 'gateway' in globals():
        gateway.stop()
    sys.exit(0)


def main():
    """Main entry point."""
    global gateway

    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    logger.info("=" * 60)
    logger.info("Edge Computing Service - Starting")
    logger.info("=" * 60)

    try:
        # Initialize and start gateway
        gateway = EdgeGateway()
        gateway.start()

        logger.info("Edge Gateway is running. Press Ctrl+C to stop.")
        logger.info(f"Status: {gateway.get_status()}")

        # Keep the service running
        import time
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
    finally:
        if 'gateway' in globals():
            gateway.stop()
        logger.info("Edge Computing Service - Stopped")


if __name__ == "__main__":
    main()

