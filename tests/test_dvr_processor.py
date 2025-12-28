import pytest
import pandas as pd

# CORRECTED: Use an absolute import from the 'backend' package root
from backend.ml.dvr_processor import DVRProcessor


@pytest.fixture
def dvr_processor() -> DVRProcessor:
    """
    A pytest fixture to provide a fresh instance of DVRProcessor for each test.
    """
    return DVRProcessor()


@pytest.fixture
def sample_batch_data() -> pd.DataFrame:
    """
    Provides a sample DataFrame with 5 rows of data for testing.
    """
    data = {
        "Pressure_In": [3.5, 3.6, 3.55, 3.65, 3.7],
        "Temperature_In": [20, 21, 22, 21.5, 22.5],
        "Flow_Rate": [12.0, 12.1, 12.2, 12.0, 12.3],
        "Pressure_Out": [17, 17.2, 17.1, 17.3, 17.5],
        "Efficiency": [0.85, 0.86, 0.85, 0.87, 0.84],
        "Vibration": [0.9, 0.95, 1.0, 1.1, 0.98],
        "Ambient_Temperature": [25, 26, 25.5, 26.5, 27],
        "Power_Consumption": [5500, 5600, 5550, 5650, 5700],
    }
    return pd.DataFrame(data)


# --- Test Case 1: Happy Path ---
def test_valid_data_should_pass_all_rules(dvr_processor, sample_batch_data):
    """
    Tests the "happy path" scenario where all data is valid and should pass
    all rule-based checks.
    """
    # Arrange
    valid_data = sample_batch_data

    # Act
    processed_df = dvr_processor.apply_rule_based_checks(valid_data)

    # Assert
    assert processed_df["all_rules_pass"].all()
    assert not processed_df["rule_violation_flag"].any()


# --- Test Case 2: Invalid Range ---
def test_invalid_pressure_data_should_fail_rules(dvr_processor, sample_batch_data):
    """
    Tests that a row with an out-of-range physical value correctly fails
    the rule-based checks.
    """
    # Arrange
    invalid_data = sample_batch_data.copy()
    invalid_row_index = 2
    invalid_data.loc[invalid_row_index, "Pressure_In"] = 10.0

    # Act
    processed_df = dvr_processor.apply_rule_based_checks(invalid_data)

    # Assert
    assert not processed_df.loc[invalid_row_index, "all_rules_pass"]
    assert processed_df.loc[invalid_row_index, "rule_violation_flag"]
    assert not processed_df.loc[invalid_row_index, "rule_pressure_in"]


# --- Test Case 3: Invalid Rate-of-Change ---
def test_invalid_roc_data_should_fail_rules(dvr_processor, sample_batch_data):
    """
    Tests that a row with an invalid rate-of-change correctly fails the
    rule-based checks.
    """
    # Arrange
    invalid_data = sample_batch_data.copy()
    invalid_row_index = 3
    previous_temp = invalid_data.loc[invalid_row_index - 1, "Temperature_In"]
    invalid_data.loc[invalid_row_index, "Temperature_In"] = previous_temp + 4.0

    # Act
    processed_df = dvr_processor.apply_rule_based_checks(invalid_data)

    # Assert
    assert not processed_df.loc[invalid_row_index, "all_rules_pass"]
    assert processed_df.loc[invalid_row_index, "rule_violation_flag"]
    assert not processed_df.loc[invalid_row_index, "rule_temp_roc"]
