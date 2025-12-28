# backend/api/routes/rto_routes.py

import logging
from flask import Blueprint, jsonify, current_app
from influxdb_client import InfluxDBClient
from backend.core.auth import require_auth, require_permissions

rto_bp = Blueprint("rto_routes", __name__)


@rto_bp.route("/efficiency_history", methods=["GET"])
@require_auth
def get_efficiency_history():
    """Fetches the last 24 hours of efficiency data from InfluxDB."""
    config = current_app.config
    try:
        with InfluxDBClient(
            url=config["INFLUXDB_URL"],
            token=config["INFLUXDB_TOKEN"],
            org=config["INFLUXDB_ORG"],
        ) as client:
            query_api = client.query_api()
            flux_query = f'''
                from(bucket: "{config["INFLUXDB_BUCKET"]}")
                  |> range(start: -24h)
                  |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
                  |> filter(fn: (r) => r["_field"] == "Efficiency")
                  |> aggregateWindow(every: 10m, fn: mean, createEmpty: false)
            '''
            tables = query_api.query(flux_query)
            results = [
                {
                    "time": record.get_time().isoformat(),
                    "efficiency": (record.get_value() * 100)
                    if isinstance(record.get_value(), (int, float))
                    else 0,
                }
                for table in tables
                for record in table.records
            ]

            results.sort(key=lambda x: x["time"])

            return jsonify(results)

    except Exception as e:
        logging.error(f"Error in /efficiency_history endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
