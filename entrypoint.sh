#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# The data import is handled by the db-importer service, so it's removed from here.

echo "--- Starting Flask Application with Gunicorn ---"

# Use Gunicorn to run the application
# -w 1: Use 1 worker process
# -k eventlet: Use the eventlet worker type for WebSocket support
# -b 0.0.0.0:5000: Bind to port 5000 on all network interfaces
# backend.api.app:app: The path to your Flask app instance
exec gunicorn --worker-class eventlet --workers 1 --bind 0.0.0.0:5000 backend.api.app:app