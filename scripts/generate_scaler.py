# generate_scaler.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import os
import logging

# --- 1. Setup Logging and Configuration ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Path to the master dataset file
CSV_FILE_PATH = "datasets/MASTER_DATASET.csv"

# Directory where the scaler files will be saved (inside the backend folder)
OUTPUT_DIR = "backend"

# Features required by the VibrationPredictor model for normalization.
# These columns must be exactly the same as the ones used during model training.
FEATURE_COLUMNS = [
    "Pressure_In",
    "Temperature_In",
    "Flow_Rate",
    "Pressure_Out",
    "Temperature_Out",
    "Efficiency",
]


def generate_and_save_scaler():
    """
    Reads the dataset, fits a StandardScaler on the specified
    feature columns, and saves the mean and scale parameters to .npy files.
    """
    logger.info("--- Starting Scaler Generation ---")

    try:
        # Read the dataset
        logger.info(f"Reading dataset from '{CSV_FILE_PATH}'...")
        df = pd.read_csv(CSV_FILE_PATH)
        logger.info("Dataset read successfully.")

        # Select the required columns
        df_features = df[FEATURE_COLUMNS]

        # Create and fit the scaler
        logger.info("Fitting StandardScaler on the data...")
        scaler = StandardScaler()
        scaler.fit(df_features)
        logger.info("Scaler fitted successfully.")

        # Define output paths
        mean_path = os.path.join(OUTPUT_DIR, "scaler_mean.npy")
        scale_path = os.path.join(OUTPUT_DIR, "scaler_scale.npy")

        # Save the mean and scale parameters
        np.save(mean_path, scaler.mean_)
        np.save(scale_path, scaler.scale_)

        logger.info("\n✅ Scaler parameters saved successfully:")
        logger.info(f"  - Mean values saved to: {mean_path}")
        logger.info(f"  - Scale (std) values saved to: {scale_path}")

    except FileNotFoundError:
        logger.error(
            f"❌ ERROR: Dataset file not found at '{CSV_FILE_PATH}'. Please check the path."
        )
    except KeyError as e:
        logger.error(f"❌ ERROR: A required column was not found in the dataset: {e}")
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")


if __name__ == "__main__":
    generate_and_save_scaler()
