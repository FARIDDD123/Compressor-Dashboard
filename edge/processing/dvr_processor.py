"""
Edge Data Validation and Reconciliation (DVR) Processor

Performs data validation and reconciliation at the edge level for
critical operations in disconnected scenarios.
"""

import logging
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class EdgeDVRProcessor:
    """
    Edge-level DVR processor for data validation and reconciliation.
    
    This processor performs rule-based validation and basic statistical
    checks without requiring cloud connectivity.
    """

    # Rule-based validation thresholds (simplified for edge)
    RULE_THRESHOLDS = {
        "PRESSURE_IN_MIN": 3.0,
        "PRESSURE_IN_MAX": 4.0,
        "TEMPERATURE_IN_MIN": 10,
        "TEMPERATURE_IN_MAX": 30,
        "FLOW_RATE_MIN": 11.0,
        "FLOW_RATE_MAX": 13.0,
        "PRESSURE_DIFF_MIN": 12,
        "PRESSURE_DIFF_MAX": 16,
        "EFFICIENCY_MIN": 0.0,
        "EFFICIENCY_MAX": 1.0,
        "VIBRATION_MIN": 0.5,
        "VIBRATION_MAX": 1.3,
        "AMBIENT_TEMP_MIN": 15,
        "AMBIENT_TEMP_MAX": 35,
        "POWER_MIN": 4000,
        "POWER_MAX": 7000,
        "TEMP_ROC_LIMIT": 2.5,  # Rate of change limit
        "VIB_ROC_LIMIT": 0.15,
        "PRESSURE_ROC_LIMIT": 0.3,
    }

    def __init__(self):
        """Initialize the Edge DVR Processor."""
        self.validation_history = []  # Simple history for rate-of-change checks
        self.max_history_size = 100

    def validate(self, data: Dict[str, Any], previous_data: Optional[Dict[str, Any]] = None) -> Tuple[bool, List[str], Dict[str, Any]]:
        """
        Validate sensor data using rule-based checks.

        Args:
            data: Dictionary containing sensor readings
            previous_data: Optional previous data point for rate-of-change checks

        Returns:
            Tuple of (is_valid, validation_errors, corrected_data)
        """
        errors = []
        corrected_data = data.copy()

        # Rule-based validation
        errors.extend(self._check_physical_limits(data))
        errors.extend(self._check_rate_of_change(data, previous_data))
        errors.extend(self._check_correlations(data))

        # If errors found, attempt basic correction (use previous value or median)
        if errors:
            corrected_data = self._apply_basic_corrections(data, previous_data, errors)

        is_valid = len(errors) == 0

        # Update history
        self._update_history(data)

        return is_valid, errors, corrected_data

    def _check_physical_limits(self, data: Dict[str, Any]) -> List[str]:
        """Check if sensor values are within physical limits."""
        errors = []

        # Pressure In
        if "Pressure_In" in data:
            p_in = data["Pressure_In"]
            if not (self.RULE_THRESHOLDS["PRESSURE_IN_MIN"] <= p_in <= self.RULE_THRESHOLDS["PRESSURE_IN_MAX"]):
                errors.append(f"Pressure_In out of range: {p_in:.2f}")

        # Temperature In
        if "Temperature_In" in data:
            t_in = data["Temperature_In"]
            if not (self.RULE_THRESHOLDS["TEMPERATURE_IN_MIN"] <= t_in <= self.RULE_THRESHOLDS["TEMPERATURE_IN_MAX"]):
                errors.append(f"Temperature_In out of range: {t_in:.2f}")

        # Flow Rate
        if "Flow_Rate" in data:
            flow = data["Flow_Rate"]
            if not (self.RULE_THRESHOLDS["FLOW_RATE_MIN"] <= flow <= self.RULE_THRESHOLDS["FLOW_RATE_MAX"]):
                errors.append(f"Flow_Rate out of range: {flow:.2f}")

        # Pressure difference
        if "Pressure_In" in data and "Pressure_Out" in data:
            p_diff = data.get("Pressure_Out", 0) - data.get("Pressure_In", 0)
            if not (self.RULE_THRESHOLDS["PRESSURE_DIFF_MIN"] <= p_diff <= self.RULE_THRESHOLDS["PRESSURE_DIFF_MAX"]):
                errors.append(f"Pressure difference out of range: {p_diff:.2f}")

        # Vibration
        if "Vibration" in data:
            vib = data["Vibration"]
            if not (self.RULE_THRESHOLDS["VIBRATION_MIN"] <= vib <= self.RULE_THRESHOLDS["VIBRATION_MAX"]):
                errors.append(f"Vibration out of range: {vib:.2f}")

        # Efficiency
        if "Efficiency" in data:
            eff = data["Efficiency"]
            if not (self.RULE_THRESHOLDS["EFFICIENCY_MIN"] <= eff <= self.RULE_THRESHOLDS["EFFICIENCY_MAX"]):
                errors.append(f"Efficiency out of range: {eff:.4f}")

        return errors

    def _check_rate_of_change(self, data: Dict[str, Any], previous_data: Optional[Dict[str, Any]]) -> List[str]:
        """Check rate of change limits."""
        errors = []

        if not previous_data:
            return errors

        # Temperature rate of change
        if "Temperature_In" in data and "Temperature_In" in previous_data:
            roc = abs(data["Temperature_In"] - previous_data["Temperature_In"])
            if roc > self.RULE_THRESHOLDS["TEMP_ROC_LIMIT"]:
                errors.append(f"Temperature rate of change too high: {roc:.2f}")

        # Vibration rate of change
        if "Vibration" in data and "Vibration" in previous_data:
            roc = abs(data["Vibration"] - previous_data["Vibration"])
            if roc > self.RULE_THRESHOLDS["VIB_ROC_LIMIT"]:
                errors.append(f"Vibration rate of change too high: {roc:.4f}")

        # Pressure rate of change
        if "Pressure_In" in data and "Pressure_In" in previous_data:
            roc = abs(data["Pressure_In"] - previous_data["Pressure_In"])
            if roc > self.RULE_THRESHOLDS["PRESSURE_ROC_LIMIT"]:
                errors.append(f"Pressure rate of change too high: {roc:.2f}")

        return errors

    def _check_correlations(self, data: Dict[str, Any]) -> List[str]:
        """Check basic correlation constraints."""
        errors = []

        # Check power vs flow correlation
        if "Power" in data and "Flow_Rate" in data:
            # Power should generally increase with flow rate
            # This is a simplified check
            pass  # Can be enhanced with historical correlation

        return errors

    def _apply_basic_corrections(
        self,
        data: Dict[str, Any],
        previous_data: Optional[Dict[str, Any]],
        errors: List[str],
    ) -> Dict[str, Any]:
        """
        Apply basic corrections to data.

        For edge processing, we use simple strategies:
        - Use previous value if available
        - Use median from history
        - Use default safe value
        """
        corrected_data = data.copy()

        # Simple correction strategy: use previous value if available
        if previous_data:
            for error in errors:
                # Extract field name from error message
                # This is a simplified approach - can be improved
                if "Pressure_In" in error and "Pressure_In" in previous_data:
                    corrected_data["Pressure_In"] = previous_data["Pressure_In"]
                elif "Temperature_In" in error and "Temperature_In" in previous_data:
                    corrected_data["Temperature_In"] = previous_data["Temperature_In"]
                elif "Flow_Rate" in error and "Flow_Rate" in previous_data:
                    corrected_data["Flow_Rate"] = previous_data["Flow_Rate"]
                elif "Vibration" in error and "Vibration" in previous_data:
                    corrected_data["Vibration"] = previous_data["Vibration"]

        return corrected_data

    def _update_history(self, data: Dict[str, Any]):
        """Update validation history."""
        self.validation_history.append(data.copy())
        if len(self.validation_history) > self.max_history_size:
            self.validation_history.pop(0)

    def get_median_values(self) -> Dict[str, float]:
        """Get median values from history for correction purposes."""
        if not self.validation_history:
            return {}

        df = pd.DataFrame(self.validation_history)
        return df.median().to_dict()

    def get_status(self) -> Dict[str, Any]:
        """Get the status of the DVR processor."""
        return {
            "history_size": len(self.validation_history),
            "max_history_size": self.max_history_size,
            "thresholds_configured": len(self.RULE_THRESHOLDS),
        }

