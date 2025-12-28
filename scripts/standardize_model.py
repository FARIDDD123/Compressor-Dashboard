# scripts/standardize_model.py
import os
import logging
import argparse
from datetime import datetime
import tensorflow as tf
import tf2onnx
import onnx

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def get_standard_onnx_filename(framework: str, model_purpose: str, version: str) -> str:
    date = datetime.now().strftime("%Y%m%d")
    return f"{framework}_{model_purpose}_{version}_{date}.onnx"


def convert_model_to_onnx(
    model_path: str, framework: str, model_purpose: str, version: str, output_dir: str
):
    if not os.path.exists(model_path):
        logger.error(f"❌ Model file not found at: {model_path}")
        return None

    os.makedirs(output_dir, exist_ok=True)
    onnx_filename = get_standard_onnx_filename(framework, model_purpose, version)
    output_path = os.path.join(output_dir, onnx_filename)

    logger.info(f"--- Starting ONNX Conversion for {framework} model ---")

    try:
        if framework == "tensorflow":
            model = tf.keras.models.load_model(model_path)

            @tf.function
            def model_function(input_tensor):
                return model(input_tensor)

            input_signature = [
                tf.TensorSpec(
                    shape=[None] + list(model.input_shape[1:]),
                    dtype=model.inputs[0].dtype,
                    name=model.inputs[0].name or "input_layer",
                )
            ]

            # We pass the 'model_function' directly and no longer create the 'concrete_func' ourselves.
            model_proto, _ = tf2onnx.convert.from_function(
                model_function, input_signature, opset=13
            )

            with open(output_path, "wb") as f:
                f.write(model_proto.SerializeToString())

        # (Add logic for other frameworks here in the future)

        onnx_model = onnx.load(output_path)
        onnx.checker.check_model(onnx_model)
        logger.info(f"✅ Model successfully converted and saved to '{output_path}'")
        logger.info("Validation successful.")
        return output_path

    except Exception as e:
        logger.error(f"❌ An error occurred during conversion: {e}", exc_info=True)
        return None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Standardize and convert ML models to ONNX."
    )
    parser.add_argument(
        "model_path", type=str, help="Path to the input model file (e.g., .h5, .keras)."
    )
    parser.add_argument(
        "--framework",
        type=str,
        required=True,
        choices=["tensorflow", "pytorch", "sklearn"],
        help="The framework of the model.",
    )
    parser.add_argument(
        "--purpose",
        type=str,
        default="model",
        help="A short description of the model's purpose (e.g., rul_prediction).",
    )
    parser.add_argument(
        "--version",
        type=str,
        default="v1.0",
        help="The version of the model (e.g., v1.1).",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="artifacts",
        help="Directory to save the final ONNX model.",
    )

    args = parser.parse_args()

    convert_model_to_onnx(
        args.model_path, args.framework, args.purpose, args.version, args.output_dir
    )
