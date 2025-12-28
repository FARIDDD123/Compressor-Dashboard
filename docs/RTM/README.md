# Real-Time Monitoring (RTM) Module

**Version:** 1.0
**Date:** September 9, 2025

## 1. Goal

The primary goal of the Real-Time Monitoring (RTM) module is to continuously analyze the live stream of sensor data to detect anomalies and provide immediate alerts. This module acts as the first line of defense, identifying potential issues before they escalate into critical failures.

Unlike traditional threshold-based systems, our RTM module uses a hybrid approach, combining **real-time feature engineering** with a **supervised machine learning model** for higher accuracy and fewer false alarms.

---

## 2. Workflow

The entire RTM process is handled by the `rtm-consumer` microservice, which follows these steps for each incoming data point:

1.  **Data Consumption:** The service consumes raw sensor data from the `sensors-raw` Kafka topic.

2.  **Stateful Buffering:** It maintains a small, rolling buffer (a `deque` of size 5) of the most recent data points. This buffer is crucial for the next step.

3.  **Real-Time Feature Engineering:** As soon as the buffer is full, the service calculates four new, powerful features for the *latest* data point:
    * `Vibration_roll_mean`: The average vibration over the last 5 data points.
    * `Vibration_roll_std`: The standard deviation of vibration, indicating volatility.
    * `Power_Consumption_roll_mean`: The average power consumption trend.
    * `Power_Consumption_roll_std`: The volatility of power consumption.

4.  **Prediction:** The original 16 features plus the 4 new engineered features (20 features in total) are sent to the pre-trained `RandomForestClassifier` model (`isolation_forest_model.onnx`). The model returns a prediction: `1` for "Normal" and `-1` for "Anomaly".

5.  **Alerting:** If the prediction is `-1` (Anomaly), a detailed alert message is immediately published to the `alerts` Kafka topic. The main `backend` service listens to this topic and forwards the alert to the dashboard via WebSocket.

6.  **MLOps Logging:** Every single prediction, whether normal or anomalous, is logged to the `prediction_logs` table in MySQL. This includes the input features, the model's prediction, and the processing latency, enabling future performance monitoring.

---

## 3. The Machine Learning Model

* **Model:** `RandomForestClassifier` (a supervised learning model).
* **Reason for Choice:** Initial tests with an unsupervised `IsolationForest` model showed a high rate of missed anomalies (low recall). The RandomForest model, trained on the `Status` column as the ground truth, demonstrated significantly higher performance.
* **Performance Metrics (on test data):**
    * **Anomaly Recall:** 95% (correctly identifies 95% of real anomalies).
    * **Anomaly Precision:** 98% (98% of its alerts are correct).
* **Input Features:** 20 numerical features, including the 4 real-time engineered features.

This supervised approach, combined with real-time feature engineering, makes our RTM module highly accurate and reliable for production use.