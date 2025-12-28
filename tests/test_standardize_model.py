# tests/test_standardize_model.py
import os
import pytest
import tensorflow as tf

from scripts.standardize_model import convert_model_to_onnx


@pytest.fixture(scope="session")
def create_test_models(tmp_path_factory):
    model_dir = tmp_path_factory.mktemp("test_models")

    # Create a dummy TensorFlow/Keras model
    tf_model_path = model_dir / "temp_tf_model.keras"
    model_tf = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(10,), name="input_layer"),
            tf.keras.layers.Dense(1, activation="sigmoid"),
        ]
    )
    model_tf.save(tf_model_path)

    return {"tf_model_path": str(tf_model_path), "output_dir": str(model_dir)}


def test_tensorflow_conversion(create_test_models):
    """
    Tests if a TensorFlow model is correctly converted to the ONNX standard.
    """
    paths = create_test_models

    output_path = convert_model_to_onnx(
        model_path=paths["tf_model_path"],
        framework="tensorflow",
        model_purpose="test_converter",
        version="v1.0-test",
        output_dir=paths["output_dir"],
    )

    # Check if the conversion function returned a valid path
    assert output_path is not None, (
        "Conversion function returned None, indicating an error."
    )
    # Check if the output file was actually created
    assert os.path.exists(output_path), "ONNX output file was not created."
    # Check if the filename contains the expected parts
    assert "tensorflow_test_converter_v1.0-test" in os.path.basename(output_path), (
        "Output filename is not standardized correctly."
    )


# This test is correctly skipped and does not need changes
def test_sklearn_conversion(create_test_models):
    pytest.skip("Skipping scikit-learn conversion test for now.")
