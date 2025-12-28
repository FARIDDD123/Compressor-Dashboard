# Dockerfile (Final Version for Flexible Commands)

# --- Stage 1: The "Builder" stage ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Create a virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# --- Stage 2: The "Final" lightweight stage ---
FROM python:3.11-slim

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Activate the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Copy all application code
COPY . .

# Make entrypoint script executable (in case it's used)
RUN if [ -f entrypoint.sh ]; then chmod +x entrypoint.sh; fi