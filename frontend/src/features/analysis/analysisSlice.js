// src/features/analysis/analysisSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAnalysisData } from '../../api/analysisApi';

export const fetchAnalysisData = createAsyncThunk(
  'analysis/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAnalysisData(params);
      return { analysis_type: params.analysis_type, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  trendData: [],
  correlationData: {},
  distributionData: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalysisData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAnalysisData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { analysis_type, data } = action.payload;
        if (analysis_type === 'trend') {
            state.trendData = data;
        } else if (analysis_type === 'correlation') {
            state.correlationData = data;
        } else if (analysis_type === 'distribution') {
            state.distributionData = data;
        }
      })
      .addCase(fetchAnalysisData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default analysisSlice.reducer;