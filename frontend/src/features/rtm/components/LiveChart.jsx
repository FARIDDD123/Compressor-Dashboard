import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts';

const LiveChart = ({ data }) => {
  // A custom dot renderer to show anomalies in red
    const renderCustomDot = (props) => {
        const { cx, cy, payload, key, ...rest } = props; // Separate key from the rest of the props
        if (payload.isAnomaly) {
        return <circle key={key} cx={cx} cy={cy} r={6} fill="red" stroke="white" strokeWidth={2} />;
        }
        // Pass the key directly and spread the rest
        return <Dot key={key} {...rest} r={3} />;
    };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3>Live Sensor Data</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" label={{ value: 'Pressure / Flow', angle: -90, position: 'insideLeft', fill: '#8884d8' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Temperature', angle: -90, position: 'insideRight', fill: '#82ca9d' }} />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Pressure_In"
            stroke="#8884d8"
            dot={renderCustomDot}
            activeDot={{ r: 8 }}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Temperature_In"
            stroke="#82ca9d"
            dot={false} // We can disable default dots if custom one is used, or let custom one handle it
            activeDot={{ r: 8 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// This line is the crucial fix!
export default LiveChart;