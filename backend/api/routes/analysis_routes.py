# backend/api/routes/analysis_routes.py

import logging
from flask import Blueprint, jsonify, current_app, request
from influxdb_client import InfluxDBClient
import pandas as pd
import numpy as np
import json

analysis_bp = Blueprint("analysis_routes", __name__)


def query_influx_for_analysis(config, time_range, sensors):
    """A helper function to query multiple sensors from InfluxDB and return a DataFrame."""
    with InfluxDBClient(
        url=config["INFLUXDB_URL"],
        token=config["INFLUXDB_TOKEN"],
        org=config["INFLUXDB_ORG"],
    ) as client:
        query_api = client.query_api()
        sensors_flux_array = json.dumps(sensors)

        flux_query = f'''
            from(bucket: "{config["INFLUXDB_BUCKET"]}")
              |> range(start: {time_range})
              |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
              |> filter(fn: (r) => contains(value: r._field, set: {sensors_flux_array}))
              |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        '''
        tables = query_api.query(flux_query)

        # --- THIS IS THE FIX: Manually construct the DataFrame ---
        if not tables:
            return pd.DataFrame()

        records_list = []
        for table in tables:
            for record in table.records:
                records_list.append(record.values)

        if not records_list:
            return pd.DataFrame()

        df = pd.DataFrame(records_list).rename(columns={"_time": "time"})
        return df


@analysis_bp.route("/query", methods=["POST"])
def perform_analysis():
    """A powerful endpoint for various statistical analyses on sensor data."""
    config = current_app.config
    payload = request.get_json()
    if not payload:
        return jsonify({"error": "Invalid JSON payload"}), 400

    analysis_type = payload.get("analysis_type", "trend")
    time_range = payload.get("time_range", "-24h")
    sensor1 = payload.get("sensor1")
    sensor2 = payload.get("sensor2")

    if not sensor1:
        return jsonify({"error": "sensor1 is a required parameter"}), 400

    try:
        if analysis_type == "trend":
            df = query_influx_for_analysis(config, time_range, [sensor1])
            if df.empty:
                return jsonify([])

            # --- این بخش اصلاح شده و کلیدی است ---
            # 1. اطمینان از اینکه ستون زمان از نوع datetime است
            df["time"] = pd.to_datetime(df["time"])

            # 2. تبدیل ستون سنسور به نوع عددی؛ مقادیر نامعتبر به NaN تبدیل می‌شوند
            df[sensor1] = pd.to_numeric(df[sensor1], errors="coerce")

            # 3. حذف سطرهایی که مقدار سنسور در آن‌ها NaN است (یعنی تبدیل ناموفق بوده)
            df.dropna(subset=[sensor1], inplace=True)

            # اگر پس از پاکسازی داده‌ای باقی نماند، لیست خالی برگردان
            if df.empty:
                return jsonify([])

            # 4. حالا با خیال راحت میانگین را محاسبه کن
            # داده‌ها بر اساس بازه‌های زمانی 10 دقیقه‌ای گروه‌بندی (resample) شده و میانگین آن‌ها محاسبه می‌شود
            df_resampled = (
                df.set_index("time")[[sensor1]].resample("10T").mean().dropna()
            )

            results = df_resampled.reset_index().to_dict("records")
            return jsonify(results)

        elif analysis_type == "correlation":
            if not sensor2:
                return jsonify(
                    {"error": "sensor2 is required for correlation analysis"}
                ), 400
            df = query_influx_for_analysis(config, time_range, [sensor1, sensor2])

            # --- این اصلاح برای بخش Correlation هم اعمال شود ---
            df[sensor1] = pd.to_numeric(df[sensor1], errors="coerce")
            df[sensor2] = pd.to_numeric(df[sensor2], errors="coerce")

            df_clean = df[[sensor1, sensor2]].dropna()

            if df_clean.empty or len(df_clean) < 2:
                return jsonify({"correlation_coefficient": None, "plot_data": []})

            correlation = df_clean.corr().iloc[0, 1]
            plot_data = df_clean.sample(n=min(len(df_clean), 500)).to_dict("records")
            return jsonify(
                {"correlation_coefficient": correlation, "plot_data": plot_data}
            )

        elif analysis_type == "distribution":
            df = query_influx_for_analysis(config, time_range, [sensor1])

            # --- این اصلاح برای بخش Distribution هم اعمال شود ---
            df[sensor1] = pd.to_numeric(df[sensor1], errors="coerce")

            sensor_data = df[sensor1].dropna()

            if sensor_data.empty:
                return jsonify([])

            counts, bin_edges = np.histogram(sensor_data, bins=20)
            results = [
                {
                    "range": f"{bin_edges[i]:.2f}-{bin_edges[i + 1]:.2f}",
                    "count": int(counts[i]),
                }
                for i in range(len(counts))
            ]
            return jsonify(results)

        else:
            return jsonify({"error": "Invalid analysis_type"}), 400

    except Exception as e:
        logging.error(f"Error in /analysis/query endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
