# Data Validation & Reconciliation (DVR)


## Objective
Ensure the reliability of sensor data by detecting and correcting faulty measurements before they affect downstream AI modules (like PdM or RTO).


## Algorithms Used

| Algorithm                     | Purpose                                                                 |
|-------------------------------|-------------------------------------------------------------------------|
| ✅ Rule-Based Checks           | Detect physically invalid data (e.g., negative flow, extreme temperature) |
| ✅ PCA (Principal Component Analysis) | Identify multivariate anomalies due to correlated sensor faults         |
| ⏳ WLS (Weighted Least Squares)      | Reconstruct missing or noisy values using sensor relationships         |
| ⏳ Bayesian Inference          | Probabilistic estimation of true sensor values with confidence intervals |


## Tasks To-Do

- [x] Implement domain-specific rules (e.g., acceptable ranges and rate-of-change)
- [x] Apply PCA-based anomaly detection
- [ ] Implement WLS for data correction
- [ ] Apply Bayesian modeling (optional but useful)
- [ ] Visualize raw vs cleaned data, and log anomalies


## Expected Output

- Cleaned sensor dataset
- Anomaly labels (pr row or column)
- Corrected values (when possible)
- Visualization of error regions, outlier sensors, and reconstructed data


## Why It Matters

Inaccurate or missing sensor data can lead to:

- Wrong predictions in PdM models
- Dangerous optimization recommendations
- Unreliable alert systems

DVR improves **data trust**, making predictions and decisions **more robust and safe**.

