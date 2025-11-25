// src/features/pdm/pdmSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLatestRul } from '../../api/predictionApi';

// Async thunk for fetching the latest RUL data
export const fetchLatestRul = createAsyncThunk(
  'pdm/fetchLatestRul',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLatestRul();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch RUL data' });
    }
  }
);

const initialState = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const pdmSlice = createSlice({
  name: 'pdm',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestRul.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLatestRul.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchLatestRul.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.error;
      });
  },
});

export default pdmSlice.reducer;