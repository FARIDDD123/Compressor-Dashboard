// src/features/control/controlSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getControlStatus, updateControlSettings } from '../../api/controlApi';

export const fetchControlStatus = createAsyncThunk('control/fetchStatus', async () => {
  const response = await getControlStatus();
  return response.data;
});

export const postControlUpdate = createAsyncThunk('control/postUpdate', async (settings) => {
  const response = await updateControlSettings(settings);
  return response.data.newState;
});

const initialState = {
  controlMode: 'auto',
  systemState: 'running',
  parameters: {
    targetPressure: 85,
    targetTemperature: 75,
    flowRate: 450,
    speed: 3600,
  },
  status: 'idle',
};

const controlSlice = createSlice({
  name: 'control',
  initialState,
  reducers: {
    setLocalParameters: (state, action) => {
        state.parameters = { ...state.parameters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchControlStatus.fulfilled, (state, action) => {
        return { ...state, ...action.payload, status: 'succeeded' };
      })
      .addCase(postControlUpdate.fulfilled, (state, action) => {
        return { ...state, ...action.payload, status: 'succeeded' };
      });
  },
});

export const { setLocalParameters } = controlSlice.actions;
export default controlSlice.reducer;