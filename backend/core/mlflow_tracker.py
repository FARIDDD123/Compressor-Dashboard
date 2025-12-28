"""
MLflow integration for model versioning and experiment tracking.
Implements NF-432 requirement.
"""

import os
import logging
from typing import Optional, Dict, Any
import mlflow
import mlflow.sklearn
import mlflow.pytorch
from datetime import datetime

logger = logging.getLogger(__name__)

# MLflow configuration
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")
MLFLOW_EXPERIMENT_NAME = os.getenv("MLFLOW_EXPERIMENT_NAME", "Digital-Twin-Models")


class MLflowTracker:
    """
    MLflow tracker for model versioning and experiment management.
    """

    def __init__(self):
        """Initialize MLflow tracker."""
        mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
        
        try:
            experiment = mlflow.get_experiment_by_name(MLFLOW_EXPERIMENT_NAME)
            if experiment is None:
                experiment_id = mlflow.create_experiment(MLFLOW_EXPERIMENT_NAME)
                logger.info(f"Created MLflow experiment: {MLFLOW_EXPERIMENT_NAME}")
            else:
                experiment_id = experiment.experiment_id
                logger.info(f"Using existing MLflow experiment: {MLFLOW_EXPERIMENT_NAME}")
            
            self.experiment_id = experiment_id
        except Exception as e:
            logger.error(f"Failed to initialize MLflow: {e}")
            self.experiment_id = None

    def log_model(
        self,
        model_name: str,
        model_type: str,
        model_path: str,
        model_version: str,
        metrics: Optional[Dict[str, float]] = None,
        parameters: Optional[Dict[str, Any]] = None,
        tags: Optional[Dict[str, str]] = None,
    ) -> Optional[str]:
        """
        Log a model to MLflow.
        
        Args:
            model_name: Name of the model (e.g., "RTM", "RUL", "RTO")
            model_type: Type of model ("onnx", "sklearn", "pytorch")
            model_path: Path to model file
            model_version: Version string
            metrics: Model metrics (accuracy, MAE, etc.)
            parameters: Model hyperparameters
            tags: Additional tags
            
        Returns:
            Run ID if successful, None otherwise
        """
        if self.experiment_id is None:
            logger.warning("MLflow not initialized, skipping model logging")
            return None

        try:
            with mlflow.start_run(experiment_id=self.experiment_id):
                # Set tags
                mlflow.set_tag("model_name", model_name)
                mlflow.set_tag("model_type", model_type)
                mlflow.set_tag("version", model_version)
                mlflow.set_tag("timestamp", datetime.utcnow().isoformat())
                
                if tags:
                    for key, value in tags.items():
                        mlflow.set_tag(key, str(value))
                
                # Log parameters
                if parameters:
                    mlflow.log_params(parameters)
                
                # Log metrics
                if metrics:
                    mlflow.log_metrics(metrics)
                
                # Log model artifact
                if model_type == "onnx":
                    mlflow.log_artifact(model_path, artifact_path="models")
                elif model_type == "sklearn":
                    mlflow.sklearn.log_model(model_path, "model")
                elif model_type == "pytorch":
                    mlflow.pytorch.log_model(model_path, "model")
                
                run_id = mlflow.active_run().info.run_id
                logger.info(f"✅ Logged model {model_name} v{model_version} to MLflow (run_id: {run_id})")
                
                return run_id
                
        except Exception as e:
            logger.error(f"Failed to log model to MLflow: {e}")
            return None

    def log_data_version(
        self,
        dataset_name: str,
        dataset_path: str,
        dataset_hash: str,
        description: Optional[str] = None,
    ) -> Optional[str]:
        """
        Log a dataset version to MLflow.
        
        Args:
            dataset_name: Name of the dataset
            dataset_path: Path to dataset file
            dataset_hash: Hash of the dataset (for integrity)
            description: Optional description
            
        Returns:
            Run ID if successful, None otherwise
        """
        if self.experiment_id is None:
            return None

        try:
            with mlflow.start_run(experiment_id=self.experiment_id):
                mlflow.set_tag("artifact_type", "dataset")
                mlflow.set_tag("dataset_name", dataset_name)
                mlflow.set_tag("dataset_hash", dataset_hash)
                
                if description:
                    mlflow.set_tag("description", description)
                
                mlflow.log_artifact(dataset_path, artifact_path="datasets")
                
                run_id = mlflow.active_run().info.run_id
                logger.info(f"✅ Logged dataset {dataset_name} to MLflow")
                
                return run_id
                
        except Exception as e:
            logger.error(f"Failed to log dataset to MLflow: {e}")
            return None

    def get_latest_model_version(self, model_name: str) -> Optional[Dict]:
        """Get latest version of a model from MLflow."""
        try:
            runs = mlflow.search_runs(
                experiment_ids=[self.experiment_id],
                filter_string=f"tags.model_name = '{model_name}'",
                order_by=["start_time DESC"],
                max_results=1,
            )
            
            if runs.empty:
                return None
            
            run = runs.iloc[0]
            return {
                "run_id": run["run_id"],
                "version": run["tags.model_name"],
                "timestamp": run["start_time"],
                "metrics": {k: v for k, v in run.items() if k.startswith("metrics.")},
            }
        except Exception as e:
            logger.error(f"Failed to get model version: {e}")
            return None


# Singleton instance
_mlflow_tracker: Optional[MLflowTracker] = None


def get_mlflow_tracker() -> MLflowTracker:
    """Get or create MLflow tracker instance."""
    global _mlflow_tracker
    if _mlflow_tracker is None:
        _mlflow_tracker = MLflowTracker()
    return _mlflow_tracker

