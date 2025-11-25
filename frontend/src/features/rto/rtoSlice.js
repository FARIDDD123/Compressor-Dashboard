// src/features/rto/rtoSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEfficiencyHistory } from '../../api/rtoApi'; 

export const fetchEfficiencyHistory = createAsyncThunk(
  'rto/fetchEfficiencyHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getEfficiencyHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  suggestion: null,
  history: [],
  status: 'idle',
  historyStatus: 'idle',
  error: null,
};

export const rtoSlice = createSlice({
  name: 'rto',
  initialState,
  reducers: {
    // New reducer to handle incoming WebSocket data
    updateRtoSuggestion: (state, action) => {
      state.suggestion = action.payload;
      state.status = 'succeeded';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Cases for chart history remain the same
      .addCase(fetchEfficiencyHistory.pending, (state) => {
        state.historyStatus = 'loading';
      })
      .addCase(fetchEfficiencyHistory.fulfilled, (state, action) => {
        state.historyStatus = 'succeeded';
        state.history = action.payload;
      })
      .addCase(fetchEfficiencyHistory.rejected, (state) => {
        state.historyStatus = 'failed';
      });
  },
});

// Add the new action to exports
export const { updateRtoSuggestion } = rtoSlice.actions;
export default rtoSlice.reducer;