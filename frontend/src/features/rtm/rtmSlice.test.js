import rtmReducer, {
  addDataPoint,
  addAlert,
  markAsAnomaly,
  setConnectionStatus,
  initialState,
} from './rtmSlice';

describe('RTM Slice', () => {
  it('should return initial state', () => {
    expect(rtmReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle addDataPoint', () => {
    const dataPoint = {
      Time: 1234567890,
      Pressure_In: 3.5,
      Efficiency: 0.85,
    };

    const newState = rtmReducer(initialState, addDataPoint(dataPoint));
    expect(newState.dataPoints).toHaveLength(1);
    expect(newState.dataPoints[0]).toEqual(dataPoint);
  });

  it('should handle addAlert', () => {
    const alert = {
      id: 'alert-1',
      message: 'Anomaly detected',
      timestamp: '2024-01-01T12:00:00Z',
    };

    const newState = rtmReducer(initialState, addAlert(alert));
    expect(newState.alerts).toHaveLength(1);
    expect(newState.alerts[0]).toEqual(alert);
  });

  it('should handle markAsAnomaly', () => {
    const anomaly = {
      time_id: 1234567890,
      causes: ['High vibration'],
    };

    const newState = rtmReducer(initialState, markAsAnomaly(anomaly));
    expect(newState.anomalies).toHaveLength(1);
    expect(newState.anomalies[0]).toEqual(anomaly);
  });

  it('should handle setConnectionStatus', () => {
    const newState = rtmReducer(initialState, setConnectionStatus(true));
    expect(newState.isConnected).toBe(true);
  });
});

