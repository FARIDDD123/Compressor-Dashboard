import pytest
import numpy as np
import onnx
from onnx import helper
from onnx import TensorProto

# We import the module we want to test from its new path.
from backend.ml.onnx_predictor import ONNXPredictor, DART_MODEL_FEATURES


@pytest.fixture
def mock_db_config():
    """Provides a mock database configuration for tests."""
    return {
        "host": "dummy_host",
        "port": 3306,
        "user": "dummy_user",
        "password": "dummy_password",
        "database": "dummy_db",
    }


@pytest.fixture(scope="module")
def create_dummy_onnx_model(tmp_path_factory):
    """
    Creates a simple, valid ONNX model for testing purposes that expects inputs
    with the same number of features as DART_MODEL_FEATURES.
    """
    model_dir = tmp_path_factory.mktemp("dummy_models")
    model_path = str(model_dir / "dummy_dart_model.onnx")

    num_features = len(DART_MODEL_FEATURES)

    # Define the graph inputs and outputs
    X = helper.make_tensor_value_info(
        "input_layer", TensorProto.FLOAT, [None, num_features]
    )
    Y = helper.make_tensor_value_info("output_layer", TensorProto.FLOAT, [None, 1])

    # --- THE FIX for "Unrecognized attribute: axes" ---
    # In modern ONNX, 'axes' is an input, not an attribute.
    # We create a constant tensor to specify the axes for the ReduceSum operator.
    axes_tensor = helper.make_tensor(
        name="axes",
        data_type=TensorProto.INT64,
        dims=(1,),
        vals=[1],  # Sum across the feature axis (axis=1)
    )
    axes_const_node = helper.make_node(
        "Constant", inputs=[], outputs=["axes"], value=axes_tensor
    )

    # The ReduceSum node now takes 'axes' as a second input
    reduce_sum_node = helper.make_node(
        "ReduceSum",
        inputs=["input_layer", "axes"],  # 'axes' is now an input
        outputs=["output_layer"],
        keepdims=1,
    )

    # Create the graph with both the constant node and the ReduceSum node
    graph_def = helper.make_graph(
        [axes_const_node, reduce_sum_node],
        "dummy-model-graph",
        [X],
        [Y],
    )

    # Create and save the model, specifying the opset version
    model_def = helper.make_model(
        graph_def,
        producer_name="pytest-producer",
        opset_imports=[helper.make_opsetid("", 13)],
    )
    onnx.save(model_def, model_path)

    return model_path


def test_onnx_predictor_initialization(create_dummy_onnx_model, mock_db_config):
    """Tests if the ONNXPredictor class can be initialized successfully."""
    try:
        predictor = ONNXPredictor(
            onnx_model_path=create_dummy_onnx_model, db_config=mock_db_config
        )
        assert predictor is not None
        assert predictor.expected_features == len(DART_MODEL_FEATURES)
    except Exception as e:
        pytest.fail(f"ONNXPredictor initialization failed: {e}")


def test_data_preprocessing_logic(create_dummy_onnx_model, mock_db_config):
    """
    Tests the core data preprocessing logic to ensure it correctly shapes the data.
    This directly tests the fix for issue #131.
    """
    predictor = ONNXPredictor(
        onnx_model_path=create_dummy_onnx_model, db_config=mock_db_config
    )

    sample_records = [dict(zip(DART_MODEL_FEATURES, range(len(DART_MODEL_FEATURES))))]

    processed_array = predictor._preprocess_data(sample_records)

    assert isinstance(processed_array, np.ndarray)
    expected_shape = (len(sample_records), len(DART_MODEL_FEATURES))
    assert processed_array.shape == expected_shape
