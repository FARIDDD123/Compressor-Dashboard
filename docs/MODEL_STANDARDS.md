# Model Standardization and Versioning Strategy

This document outlines the official standards for managing machine learning models in the Compressor Digital Twin project. Following these guidelines ensures consistency, interoperability, and maintainability.

## 1. Final Model Format: ONNX

All models, regardless of their original training framework (TensorFlow, PyTorch, Scikit-learn), **must** be converted to the **ONNX (Open Neural Network Exchange)** format before being integrated into the main application.

**Rationale:**
- **Interoperability:** ONNX allows us to use a single, high-performance inference engine (`onnxruntime`) in our backend, regardless of how the model was trained.
- **Performance:** ONNX models are optimized for fast inference.
- **Decoupling:** It decouples the data science training environment from the production deployment environment.

---

## 2. Naming Convention

All final ONNX models must follow a strict naming convention and be stored in the `/artifacts` directory.

**Format:**
`{framework}_{model_purpose}_{version}_{date}.onnx`

**Components:**
- **`{framework}`:** The original training framework (e.g., `tensorflow`, `pytorch`, `sklearn`).
- **`{model_purpose}`:** A short, descriptive name for the model's task (e.g., `rul_prediction`, `status_classifier`).
- **`{version}`:** The model version in the format `vX.Y`. See Versioning Guidelines below.
- **`{date}`:** The date of export in `YYYYMMDD` format.

**Example:**
`tensorflow_rul_prediction_v1.0_20250813.onnx`

---

## 3. Versioning Guidelines

A clear versioning scheme is critical for tracking model improvements and changes.

- **Major Version (`vX.y`)**: Increment the major version for significant changes that break backward compatibility. Examples:
  - Changing the model architecture (e.g., adding/removing layers).
  - Changing the set of input or output features.

- **Minor Version (`vx.Y`)**: Increment the minor version for improvements that are backward-compatible. Examples:
  - Re-training the same model architecture with new or cleaned data.
  - Fine-tuning hyperparameters.

---

## 4. Conversion Process

To convert a trained model to the standard ONNX format, use the provided command-line tool. This ensures all models are created with the correct naming convention.

**Example Command:**
```bash
python scripts/standardize_model.py "path/to/your/model.h5" --framework "tensorflow" --purpose "rul_prediction" --version "v1.0"
```

The script will automatically generate the correctly named `.onnx` file in the `/artifacts` directory.

---

## 5. Model Registry

**Status: Under Investigation**

To effectively manage the lifecycle of our models (tracking experiments, lineage, and deployments), we will adopt a Model Registry tool. The team is currently evaluating options, with **MLflow** being a primary candidate. This section will be updated once a final decision is made.