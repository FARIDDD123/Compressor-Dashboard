# System Architecture - SGT-400 Compressor Dashboard

**Version:** 1.0
**Date:** September 9, 2025

## 1. Overview

This document provides a detailed overview of the technical architecture for the SGT-400 Compressor Digital Twin Gas Turbine 1 project. The system is designed as a **distributed, microservice-based architecture** to ensure scalability, maintainability, and real-time performance.

The primary goal of this architecture is to create an end-to-end data pipeline that:
1.  Streams historical data to simulate a live feed.
2.  Stores and processes this data in real-time.
3.  Runs multiple machine learning models for analysis and prediction.
4.  Serves the results to an interactive web-based dashboard.

The entire system is containerized using **Docker** and orchestrated with **Docker Compose** for easy local development and future deployment.



---

## 2. Data Pipeline & Workflow

The heart of the system is a data pipeline orchestrated by **Apache Kafka**. This pipeline ensures that data flows reliably between different services.

The data journey follows these steps:

1.  **Data Simulation (`db-streamer`):**
    * A Python service reads the historical `MASTER_DATASET.csv` from a **MySQL** database.
    * It sends each row of data, one by one, as a message to the `sensors-raw` topic in Kafka.
    * The timestamp of each record is updated to the current time to simulate a live, real-time feed.

2.  **Data Persistence (`influx-writer`):**
    * A dedicated consumer listens to the `sensors-raw` topic.
    * It writes every incoming raw data point into an **InfluxDB** time-series database. This creates a historical log of all sensor readings.

3.  **Data Validation (`dvr-consumer`):**
    * This service also consumes from the `sensors-raw` topic.
    * It applies rule-based checks and statistical validation (as defined in `dvr_processor.py`).
    * The cleaned and validated data is then published to a new Kafka topic: `sensors-validated`.

4.  **Real-Time Monitoring (`rtm-consumer`):**
    * This consumer listens to the `sensors-raw` topic.
    * For each data point, it performs real-time feature engineering (calculating rolling means and standard deviations).
    * It runs the `RandomForest` anomaly detection model.
    * If an anomaly is detected, it publishes an alert message to the `alerts` topic.
    * It also logs every prediction to the `prediction_logs` table in MySQL for MLOps purposes.

5.  **Real-Time Optimization (`rto-consumer`):**
    * This consumer listens to the **`sensors-validated`** topic (using clean data).
    * It runs the PPO reinforcement learning model to generate an optimization suggestion.
    * The latest suggestion is stored in the `rto_suggestions` table in MySQL.

6.  **Predictive Maintenance (`pdm-batch-runner`):**
    * This service runs once on startup.
    * It fetches the latest sequence of data from InfluxDB.
    * It runs the LSTM-based `rul_model.onnx` to predict the Remaining Useful Life (RUL).
    * The result is stored in the `rul_predictions` table in MySQL.

---

## 3. Core Technologies

### 3.1. Backend Services
* **Web Server:** The main API is a **Flask** application, served by **Gunicorn** with `eventlet` workers to handle both HTTP and WebSocket traffic efficiently.
* **Messaging Queue:** **Apache Kafka** is used as the central nervous system for asynchronous communication between all microservices.
* **Containerization:** All services are containerized with **Docker** and orchestrated via a single `docker-compose.yml` file.

### 3.2. Databases
* **MySQL:** Used as the primary relational database for:
    * Storing the initial historical dataset (`compressor_data` table).
    * Storing prediction results (`rul_predictions`, `rto_suggestions`).
    * Storing MLOps logs (`prediction_logs`).
* **InfluxDB:** Used as a high-performance time-series database (TSDB) for:
    * Storing all raw sensor data for historical querying.
    * Storing validated sensor data.

### 3.3. Frontend
* **Framework:** A modern, responsive dashboard built with **React**.
* **Styling:** **Material-UI (MUI)** is used for all UI components to ensure a consistent and professional look.
* **State Management:** **Redux Toolkit** is used to manage the application's state, including live data from WebSockets.
* **Real-Time Communication:** The frontend maintains a persistent **WebSocket** connection with the backend server to receive live data (`new_data`) and alerts (`new_alert`).

---

## 4. How Services Interact

* The `db-streamer` is the starting point of the data flow.
* All other consumers (`influx-writer`, `dvr-consumer`, `rtm-consumer`) work in parallel, consuming raw data as it becomes available in Kafka.
* The `backend` service is the central hub for the frontend. It reads from the `alerts` and `sensors-raw` topics in Kafka and pushes updates to the dashboard via WebSocket. It also provides REST APIs for the frontend to fetch data from the MySQL and InfluxDB databases.