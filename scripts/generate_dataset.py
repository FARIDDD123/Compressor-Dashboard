import numpy as np
import pandas as pd
import os
import argparse
from typing import Dict


# --- 1. DataGenerator Class: Encapsulates all logic and configuration ---
class DataGenerator:
    """
    A class to generate synthetic time-series data for SGT-400 compressors.
    """

    def __init__(self, config: Dict):
        """
        Initializes the generator with physical and generation parameters.
        """
        # --- Physical Constants ---
        self.MW = 16.04  # kg/kmol
        self.R = 8.314 / self.MW  # kJ/kg.K
        self.GAMMA = 1.31
        self.CP = self.GAMMA * self.R / (self.GAMMA - 1)

        # --- Generation Configuration ---
        self.num_devices = config.get("num_devices", 10)
        self.records_per_device = config.get("records_per_device", 1_000_000)
        self.chunk_size = config.get("chunk_size", 500_000)
        self.output_dir = config.get("output_dir", "compressor_datasets")
        os.makedirs(self.output_dir, exist_ok=True)

        # --- Noise and Missing Data Config ---
        self.noise_fraction = 0.05
        self.missing_fraction = 0.03

    def _generate_base_signals(
        self, time: np.ndarray, chunk_size: int
    ) -> Dict[str, np.ndarray]:
        """Generates the primary sensor signals using sine waves and random noise."""
        signals = {
            "pressure_in": 3.5
            + 0.2 * np.sin(0.05 * time)
            + np.random.normal(0, 0.05, chunk_size),
            "temperature_in": 293
            + 5 * np.cos(0.03 * time)
            + np.random.normal(0, 1, chunk_size),
            "flow_rate": 12
            + 0.5 * np.sin(0.04 * time)
            + np.random.normal(0, 0.1, chunk_size),
            "efficiency": 0.82
            + 0.02 * np.sin(0.02 * time)
            + np.random.normal(0, 0.005, chunk_size),
            "vibration": 1.0
            + 0.3 * np.sin(0.06 * time)
            + np.random.normal(0, 0.05, chunk_size),
            "pressure_ratio": 5.0
            + 0.2 * np.sin(0.05 * time)
            + np.random.normal(0, 0.05, chunk_size),
        }
        return signals

    def _calculate_derived_values(self, signals: Dict) -> Dict[str, np.ndarray]:
        """Calculates physics-based values from the base signals."""
        signals["pressure_out"] = signals["pressure_in"] * signals["pressure_ratio"]
        signals["temperature_out"] = signals["temperature_in"] * (
            signals["pressure_ratio"]
            ** ((self.GAMMA - 1) / (self.GAMMA * signals["efficiency"]))
        )
        signals["power_consumption"] = (
            signals["flow_rate"]
            * self.CP
            * (signals["temperature_out"] - signals["temperature_in"])
            / signals["efficiency"]
        )
        return signals

    def _label_status(self, signals: Dict) -> Dict[str, np.ndarray]:
        """Determines the operational status based on vibration and power thresholds."""
        normal_threshold = np.percentile(signals["vibration"], 65)
        imbalance_threshold = np.percentile(signals["vibration"], 85)
        power_threshold = np.percentile(signals["power_consumption"], 65)
        fault_power_threshold = np.percentile(signals["power_consumption"], 85)

        signals["status"] = np.where(
            (signals["vibration"] < normal_threshold)
            & (signals["power_consumption"] < power_threshold)
            & (signals["efficiency"] > 0.80),
            "Normal",
            np.where(
                (
                    (signals["vibration"] >= normal_threshold)
                    & (signals["vibration"] < imbalance_threshold)
                )
                | (
                    (signals["power_consumption"] >= power_threshold)
                    & (signals["power_consumption"] < fault_power_threshold)
                ),
                "Imbalance",
                "Fault",
            ),
        )
        return signals

    def _create_dataframe(
        self, time: np.ndarray, device_id: int, signals: Dict, chunk_size: int
    ) -> pd.DataFrame:
        """Assembles the final DataFrame from all generated signals."""
        return pd.DataFrame(
            {
                "Time": time,
                "Device_ID": f"SGT-400-{device_id:02d}",
                "Pressure_In": signals["pressure_in"],
                "Temperature_In": signals["temperature_in"]
                - 273.15,  # Convert to Celsius
                "Flow_Rate": signals["flow_rate"],
                "Pressure_Out": signals["pressure_out"],
                "Temperature_Out": signals["temperature_out"]
                - 273.15,  # Convert to Celsius
                "Efficiency": signals["efficiency"],
                "Power_Consumption": signals["power_consumption"],
                "Vibration": signals["vibration"],
                "Status": signals["status"],
            }
        )

    def _inject_imperfections(self, df: pd.DataFrame) -> pd.DataFrame:
        """Injects random noise and missing values into the DataFrame."""
        chunk_size = len(df)

        # Inject Noise (5%)
        num_noisy = int(self.noise_fraction * chunk_size)
        noisy_indices = np.random.choice(df.index, size=num_noisy, replace=False)
        noise_std = {
            "Pressure_In": 0.2,
            "Temperature_In": 1.0,
            "Flow_Rate": 0.2,
            "Vibration": 0.1,
            "Efficiency": 0.01,
        }
        for col, std in noise_std.items():
            df.loc[noisy_indices, col] += np.random.normal(0, std, size=num_noisy)

        # Inject Missing Values (3%)
        num_missing = int(self.missing_fraction * chunk_size)
        missing_indices = np.random.choice(df.index, size=num_missing, replace=False)
        for col in ["Power_Consumption", "Temperature_Out", "Efficiency", "Vibration"]:
            df.loc[missing_indices, col] = np.nan

        return df

    def generate_chunk(
        self, start_time: int, chunk_size: int, device_id: int
    ) -> pd.DataFrame:
        """Generates a single, complete chunk of synthetic data."""
        np.random.seed(start_time + device_id)
        time = np.arange(start_time, start_time + chunk_size)

        signals = self._generate_base_signals(time, chunk_size)
        signals = self._calculate_derived_values(signals)
        signals = self._label_status(signals)

        df = self._create_dataframe(time, device_id, signals, chunk_size)
        df = self._inject_imperfections(df)

        return df

    def run_generation_loop(self):
        """Runs the main loop to generate and save data for all devices."""
        for device_id in range(1, self.num_devices + 1):
            print(f"\n📦 Generating data for device SGT-400-{device_id:02d}...")
            num_chunks = self.records_per_device // self.chunk_size

            for chunk_index in range(num_chunks):
                start_time = chunk_index * self.chunk_size
                df_chunk = self.generate_chunk(start_time, self.chunk_size, device_id)

                filename = f"{self.output_dir}/SGT-400-{device_id:02d}_chunk_{chunk_index + 1:02d}.csv"
                df_chunk.to_csv(filename, index=False)
                print(
                    f"✅ Chunk {chunk_index + 1}/{num_chunks} for device SGT-400-{device_id:02d} saved."
                )


# --- 4. Main Execution Block with Command-Line Argument Parsing ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic compressor data.")
    parser.add_argument(
        "--devices", type=int, default=10, help="Number of devices to simulate."
    )
    parser.add_argument(
        "--records",
        type=int,
        default=1_000_000,
        help="Total records to generate per device.",
    )
    parser.add_argument(
        "--chunksize",
        type=int,
        default=500_000,
        help="Number of records per CSV file (chunk).",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="compressor_datasets",
        help="Directory to save the output CSV files.",
    )

    args = parser.parse_args()

    config = {
        "num_devices": args.devices,
        "records_per_device": args.records,
        "chunk_size": args.chunksize,
        "output_dir": args.output,
    }

    generator = DataGenerator(config)
    generator.run_generation_loop()
    print("\n🎉 Data generation complete!")
