# Predictive Maintenance (PdM) Module

**Version:** 1.0
**Date:** September 9, 2025

## 1. Goal

The goal of the Predictive Maintenance (PdM) module is to forecast the **Remaining Useful Life (RUL)** of the compressor. This provides a long-term, strategic view of the machine's health, allowing engineers to proactively schedule maintenance, order parts, and prevent costly unplanned downtime.

This module answers the critical question: "**Based on its current and historical operational data, how many days are left until this component is likely to require maintenance?**"

---

## 2. Workflow

The PdM process is designed as a **batch-oriented** workflow, executed periodically to generate an updated RUL forecast. This entire process is handled by the `pdm-batch-runner` microservice.

1.  **Scheduled Execution:** The `pdm-batch-runner` service is designed to run on a schedule (e.g., once every 24 hours).

2.  **Data Fetching:** The service connects to the **InfluxDB** database and fetches the most recent sequence of sensor data. The required length of this sequence (e.g., 60 data points) is determined by the input shape of the trained ML model.

3.  **Data Preprocessing:**
    * The fetched data sequence is loaded into a pandas DataFrame.
    * A pre-trained `StandardScaler` (from the `rul_scaler.pkl` artifact) is used to normalize the data. This step is critical to ensure that the live data has the same statistical distribution as the data the model was trained on.

4.  **Prediction:**
    * The normalized data sequence, now a NumPy array with the shape `(1, 60, 39)`, is fed into the pre-trained `rul_model.onnx`.
    * The model processes this sequence and outputs a single floating-point number, which is the predicted RUL in days.

5.  **Result Storage:**
    * The final RUL value, along with the current timestamp, is saved into the `rul_predictions` table in the **MySQL** database. This table always contains the latest available RUL forecast.

6.  **API Serving:** The main `backend` service provides an API endpoint at `/api/predict/rul` which reads the latest entry from this table and serves it to the frontend dashboard for visualization.

---

## 3. The Machine Learning Model

* **Model:** Long Short-Term Memory (LSTM) network, a type of Recurrent Neural Network (RNN) specifically designed for sequence and time-series data.
* **Reason for Choice:** LSTM models are exceptionally good at understanding long-term dependencies in time-series data, making them ideal for predicting future trends like component degradation over time.
* **Performance Metrics (on test data):**
    * **Mean Absolute Error (MAE):** 0.28 days. On average, the model's prediction is less than 7 hours away from the actual remaining life.
    * **R-squared (R²) Score:** 0.72. The model can explain over 72% of the variance in the data, indicating a strong and reliable fit.
* **Input Features:** The model uses a sequence of 39 numerical features from the dataset for its predictions.

This model provides a highly accurate and reliable forecast, enabling the engineering team to make data-driven decisions about maintenance scheduling.