// src/features/threeD/threeDSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  viewMode: 'full',
  componentFocus: 'all',
  // Add other 3D-related states here later
};

const threeDSlice = createSlice({
  name: 'threeD',
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setComponentFocus: (state, action) => {
      state.componentFocus = action.payload;
    },
  },
});

export const { setViewMode, setComponentFocus } = threeDSlice.actions;
export default threeDSlice.reducer;