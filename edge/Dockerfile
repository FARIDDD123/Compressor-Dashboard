# Edge Computing Module Dockerfile

FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy edge module
COPY edge/ ./edge/
COPY artifacts/ ./artifacts/

# Create data directory for edge storage
RUN mkdir -p /app/edge_data

# Set environment variables
ENV PYTHONPATH=/app
ENV EDGE_MODE=auto
ENV EDGE_RTM_ENABLED=true
ENV EDGE_DVR_ENABLED=true
ENV EDGE_ALERTS_ENABLED=true
ENV CLOUD_SYNC_ENABLED=true
ENV CLOUD_SYNC_INTERVAL=60

# Expose port for health check (optional)
EXPOSE 8080

# Run edge gateway
CMD ["python", "-m", "edge.main"]

