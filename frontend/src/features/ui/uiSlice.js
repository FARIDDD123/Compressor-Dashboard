// src/features/ui/uiSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notification: {
    open: false,
    message: '',
    severity: 'info', // can be 'error', 'warning', 'info', or 'success'
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
      state.notification = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.notification.open = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = uiSlice.actions;

export default uiSlice.reducer;