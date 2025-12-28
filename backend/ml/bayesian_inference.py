"""
Bayesian Inference module for DVR.
Provides probabilistic estimation of sensor values with confidence intervals.
"""

import numpy as np
import pandas as pd
from typing import Dict, Optional, Tuple
import logging

try:
    import pymc as pm
    import arviz as az
    PYMC_AVAILABLE = True
except ImportError:
    PYMC_AVAILABLE = False
    logging.warning("PyMC not available. Bayesian inference will be disabled.")

logger = logging.getLogger(__name__)


class BayesianSensorEstimator:
    """
    Bayesian estimator for sensor values.
    Provides probabilistic estimates with uncertainty quantification.
    """

    def __init__(self):
        """Initialize Bayesian estimator."""
        self.models = {}
        self.prior_means = {}
        self.prior_stds = {}

    def estimate_sensor_value(
        self,
        sensor_name: str,
        related_sensors: Dict[str, float],
        observed_value: Optional[float] = None,
        uncertainty: float = 0.1,
    ) -> Tuple[float, float, Dict]:
        """
        Estimate sensor value using Bayesian inference.
        
        Args:
            sensor_name: Name of sensor to estimate
            related_sensors: Values of related sensors (for correlation)
            observed_value: Observed value (if available, used as evidence)
            uncertainty: Uncertainty in observed value
            
        Returns:
            Tuple of (mean_estimate, std_estimate, confidence_intervals)
        """
        if not PYMC_AVAILABLE:
            logger.warning("PyMC not available, falling back to simple estimation")
            if observed_value:
                return observed_value, uncertainty, {"95%": (observed_value - 2*uncertainty, observed_value + 2*uncertainty)}
            else:
                # Simple linear relationship as fallback
                return self._simple_estimate(sensor_name, related_sensors)

        try:
            with pm.Model() as model:
                # Prior based on related sensors
                if sensor_name == "Power_Consumption":
                    # Power ~ Pressure * Flow / Efficiency
                    pressure = related_sensors.get("Pressure_In", 3.5)
                    flow = related_sensors.get("Flow_Rate", 12.0)
                    efficiency = related_sensors.get("Efficiency", 0.85)
                    
                    prior_mean = (pressure * flow) / (efficiency + 0.01)  # Avoid division by zero
                    prior_std = prior_mean * 0.15  # 15% uncertainty
                    
                elif sensor_name == "Efficiency":
                    # Efficiency depends on multiple factors
                    pressure_in = related_sensors.get("Pressure_In", 3.5)
                    pressure_out = related_sensors.get("Pressure_Out", 17.0)
                    pressure_ratio = pressure_out / (pressure_in + 0.01)
                    
                    prior_mean = 0.85 - (pressure_ratio - 16) * 0.01
                    prior_std = 0.05
                    
                else:
                    # Generic prior
                    prior_mean = related_sensors.get(sensor_name, 0.0)
                    prior_std = abs(prior_mean) * 0.1 + 0.1
                
                # Prior distribution
                sensor_value = pm.Normal(
                    sensor_name,
                    mu=prior_mean,
                    sigma=prior_std,
                )
                
                # Likelihood (if observed value available)
                if observed_value is not None:
                    observed = pm.Normal(
                        "observed",
                        mu=sensor_value,
                        sigma=uncertainty,
                        observed=observed_value,
                    )
                
                # Sample from posterior
                trace = pm.sample(
                    draws=1000,
                    tune=500,
                    return_inference_data=False,
                    progressbar=False,
                )
                
                # Extract statistics
                posterior_samples = trace[sensor_name]
                mean_estimate = float(np.mean(posterior_samples))
                std_estimate = float(np.std(posterior_samples))
                
                # Confidence intervals
                percentiles = np.percentile(posterior_samples, [2.5, 50, 97.5])
                confidence_intervals = {
                    "95%": (float(percentiles[0]), float(percentiles[2])),
                    "median": float(percentiles[1]),
                }
                
                return mean_estimate, std_estimate, confidence_intervals
                
        except Exception as e:
            logger.error(f"Bayesian estimation failed for {sensor_name}: {e}")
            # Fallback
            if observed_value:
                return observed_value, uncertainty, {"95%": (observed_value - 2*uncertainty, observed_value + 2*uncertainty)}
            return self._simple_estimate(sensor_name, related_sensors)

    def _simple_estimate(self, sensor_name: str, related_sensors: Dict[str, float]) -> Tuple[float, float, Dict]:
        """Simple estimation fallback when Bayesian inference is not available."""
        if sensor_name == "Power_Consumption":
            pressure = related_sensors.get("Pressure_In", 3.5)
            flow = related_sensors.get("Flow_Rate", 12.0)
            efficiency = related_sensors.get("Efficiency", 0.85)
            estimate = (pressure * flow) / (efficiency + 0.01)
            return estimate, estimate * 0.15, {"95%": (estimate * 0.85, estimate * 1.15)}
        
        # Generic fallback
        estimate = related_sensors.get(sensor_name, 0.0)
        return estimate, abs(estimate) * 0.1, {"95%": (estimate * 0.9, estimate * 1.1)}


def apply_bayesian_correction(
    df: pd.DataFrame,
    sensor_to_correct: str,
    related_sensors: list,
) -> pd.DataFrame:
    """
    Apply Bayesian inference to correct a sensor value.
    
    Args:
        df: DataFrame with sensor data
        sensor_to_correct: Name of sensor column to correct
        related_sensors: List of related sensor column names
        
    Returns:
        DataFrame with corrected values and confidence intervals
    """
    estimator = BayesianSensorEstimator()
    df_corrected = df.copy()
    
    for idx, row in df.iterrows():
        related_values = {sensor: row.get(sensor, 0.0) for sensor in related_sensors}
        observed_value = row.get(sensor_to_correct)
        
        mean_est, std_est, intervals = estimator.estimate_sensor_value(
            sensor_to_correct,
            related_values,
            observed_value=observed_value,
        )
        
        # Store corrected value and confidence
        df_corrected.loc[idx, f"{sensor_to_correct}_Bayesian_Estimate"] = mean_est
        df_corrected.loc[idx, f"{sensor_to_correct}_Bayesian_Uncertainty"] = std_est
        df_corrected.loc[idx, f"{sensor_to_correct}_Bayesian_CI_Lower"] = intervals["95%"][0]
        df_corrected.loc[idx, f"{sensor_to_correct}_Bayesian_CI_Upper"] = intervals["95%"][1]
    
    return df_corrected

