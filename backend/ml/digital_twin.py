"""
Digital Twin Gas Turbine 1 validation module for RTO.
Simulates RTO actions before execution to validate outcomes.
Implements FR-342 requirement.
"""

import numpy as np
import pandas as pd
from typing import Dict, Optional, Tuple
import logging
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class DigitalTwin:
    """
    Digital Twin Gas Turbine 1 for compressor system.
    Uses physics-based and data-driven models to simulate system behavior.
    """

    def __init__(self):
        """Initialize Digital Twin Gas Turbine 1 with simulation models."""
        self.models = {}
        self.scaler = StandardScaler()
        self.initialized = False

    def initialize(self, historical_data: pd.DataFrame):
        """
        Initialize Digital Twin Gas Turbine 1 with historical data.
        
        Args:
            historical_data: Historical sensor and control data
        """
        try:
            # Feature columns for simulation
            feature_cols = [
                "Pressure_In",
                "Temperature_In",
                "Flow_Rate",
                "Load_Factor",
                "Ambient_Temperature",
            ]

            # Train models for key outputs
            output_cols = ["Efficiency", "Power_Consumption", "Vibration", "Pressure_Out"]

            for output_col in output_cols:
                if output_col in historical_data.columns:
                    X = historical_data[feature_cols].fillna(method="ffill")
                    y = historical_data[output_col].fillna(method="ffill")

                    # Remove any remaining NaN
                    mask = ~(X.isna().any(axis=1) | y.isna())
                    X = X[mask]
                    y = y[mask]

                    if len(X) > 10:
                        model = RandomForestRegressor(n_estimators=50, random_state=42)
                        model.fit(X, y)
                        self.models[output_col] = model

            self.scaler.fit(historical_data[feature_cols].fillna(0))
            self.initialized = True
            logger.info("✅ Digital Twin Gas Turbine 1 initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Digital Twin Gas Turbine 1: {e}")
            self.initialized = False

    def simulate_action(
        self, current_state: Dict, proposed_action: Dict
    ) -> Tuple[Dict, bool, str]:
        """
        Simulate the outcome of a proposed control action.
        
        Args:
            current_state: Current system state (sensor readings)
            proposed_action: Proposed control action (e.g., {"Load_Factor": 0.85})
            
        Returns:
            Tuple of (predicted_state, is_safe, validation_message)
        """
        if not self.initialized:
            return (
                {},
                False,
                "Digital Twin Gas Turbine 1 not initialized. Cannot validate action.",
            )

        try:
            # Combine current state with proposed action
            simulation_state = current_state.copy()
            simulation_state.update(proposed_action)

            # Prepare features
            feature_cols = [
                "Pressure_In",
                "Temperature_In",
                "Flow_Rate",
                "Load_Factor",
                "Ambient_Temperature",
            ]

            # Fill missing values with defaults
            features = np.array([
                simulation_state.get(col, 0.0) for col in feature_cols
            ]).reshape(1, -1)

            # Predict outcomes
            predicted_state = {}
            all_predictions_valid = True

            for output_col, model in self.models.items():
                try:
                    prediction = model.predict(features)[0]
                    predicted_state[output_col] = float(prediction)
                    
                    # Validate predictions are within reasonable bounds
                    if output_col == "Efficiency" and (prediction < 0.0 or prediction > 1.0):
                        all_predictions_valid = False
                    elif output_col == "Vibration" and prediction > 2.0:  # Safety limit
                        all_predictions_valid = False
                    elif output_col == "Power_Consumption" and prediction > 10000:
                        all_predictions_valid = False
                except Exception as e:
                    logger.warning(f"Prediction error for {output_col}: {e}")
                    all_predictions_valid = False

            # Safety validation
            is_safe, safety_message = self._validate_safety(predicted_state, current_state)

            if not all_predictions_valid:
                is_safe = False
                safety_message = "Predicted values outside acceptable bounds"

            return predicted_state, is_safe, safety_message

        except Exception as e:
            logger.error(f"Error simulating action: {e}")
            return {}, False, f"Simulation error: {str(e)}"

    def _validate_safety(self, predicted_state: Dict, current_state: Dict) -> Tuple[bool, str]:
        """
        Validate that predicted state is safe.
        
        Returns:
            (is_safe, message)
        """
        # Check vibration limits
        if "Vibration" in predicted_state:
            if predicted_state["Vibration"] > 1.5:  # Emergency shutdown limit
                return False, "Predicted vibration exceeds safety limit (1.5)"

        # Check efficiency
        if "Efficiency" in predicted_state:
            if predicted_state["Efficiency"] < 0.75:  # Minimum efficiency
                return False, "Predicted efficiency below minimum (0.75)"

        # Check power consumption
        if "Power_Consumption" in predicted_state:
            if predicted_state["Power_Consumption"] > 8000:  # Max power
                return False, "Predicted power consumption exceeds limit (8000 kW)"

        # Check for large changes (stability)
        for key in ["Vibration", "Efficiency", "Power_Consumption"]:
            if key in predicted_state and key in current_state:
                change = abs(predicted_state[key] - current_state[key])
                if key == "Vibration" and change > 0.3:
                    return False, f"Large change in {key} ({change:.2f})"
                elif key == "Efficiency" and change > 0.1:
                    return False, f"Large change in {key} ({change:.2f})"

        return True, "Action validated successfully"

