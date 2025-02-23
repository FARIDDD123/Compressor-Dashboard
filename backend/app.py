from flask import Flask, jsonify
from database import CompressorDatabase  # Import database class
from vibration_predictor import VibrationPredictor  # Import prediction class
from onnxPredictor import ONNXPredictor
# Initialize the database connection
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "f1309D1309",
    "database": "compressor",
    "table": "CompressorData"
}

# Create instances of the database and predictor
db = CompressorDatabase(**db_config)
predictor = VibrationPredictor(db_config=db_config)

# Initialize Flask app
app = Flask(__name__)

@app.route('/get_all_data', methods=['GET'])
def get_all_data():
    """Retrieve all data from the database including all columns."""
    if not db.connect():
        return jsonify({"error": "Failed to connect to database"}), 500
    
    # Query to get all columns
    query = f"""
        SELECT * FROM {db.table} ORDER BY TimeData ASC
    """
    
    if not db.load_data(query=query):
        return jsonify({"error": "Failed to load data"}), 500

    return jsonify(db._data)  # Return all database records with all columns

@app.route('/predict_all', methods=['GET'])
def predict_all():
    """Returns all vibration predictions as JSON."""
    if not predictor.initialize():
        return jsonify({"error": "Failed to initialize predictor"}), 500
    
    results = predictor.predict_all()
    if not results:
        return jsonify({"message": "No predictions available"}), 404
    
    return jsonify(results)


@app.route('/dart_predictions')
def dart_predictions():
    onnx_model_path = "dart_model.onnx"  # Path to the ONNX model
    
    # Database configuration
    db_host = "localhost"
    db_user = "root"
    db_password = "f1309D1309"
    db_name = "compressor"
    db_table = "CompressorData"
    
    # Create a predictor object
    predictor = ONNXPredictor(onnx_model_path, db_host, db_user, db_password, db_name, db_table)
    predicted_values = predictor.predict_all_values()

    if not predicted_values:
        return jsonify ({{"message": "No predictions available"}})
    
    # Print the predicted values
    # for idx, predicted_value in enumerate(predicted_values):
    #     return jsonify (f"Predicted Next Vibration Value for Entry {idx + 1}: {predicted_value}")

    predictions_list = [{"Entry": idx + 1, "Predicted Value": float(value)} for idx, value in enumerate(predicted_values)]
    return jsonify ({"Dart Predictions":predictions_list})


if __name__ == '__main__':
    app.run(debug=True)



