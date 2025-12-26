// src/features/auth/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { 
  setToken, 
  setUser, 
  getToken, 
  getUser, 
  clearAuthData 
} from '../../utils/storage';
import { initializeCsrfToken } from '../../utils/csrf';
import { logAuthError } from '../../utils/errorLogger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });
      
      // Store token in sessionStorage (more secure than localStorage)
      if (response.data.token) {
        setToken(response.data.token);
      }
      if (response.data.user) {
        setUser(response.data.user);
      }
      
      // Initialize CSRF token after successful login
      initializeCsrfToken();
      
      return response.data;
    } catch (error) {
      logAuthError(error, 'login');
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ username, email, password, role }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
        role: role || 'viewer',
      });
      
      return response.data;
    } catch (error) {
      logAuthError(error, 'register');
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (token) {
        await apiClient.post(`${API_BASE_URL}/auth/logout`, {});
      }
    } catch (error) {
      // Continue with logout even if API call fails
      logAuthError(error, 'logout');
    } finally {
      // Always clear sessionStorage (more secure)
      clearAuthData();
    }
  }
);

// Load user from sessionStorage on app start
const loadUserFromStorage = () => {
  try {
    const token = getToken();
    const user = getUser();
    
    if (token && user) {
      // Initialize CSRF token if user is authenticated
      initializeCsrfToken();
      
      return {
        isAuthenticated: true,
        user,
        token,
      };
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
    clearAuthData();
  }
  
  return {
    isAuthenticated: false,
    user: null,
    token: null,
  };
};

const initialState = {
  ...loadUserFromStorage(),
  loading: false,
  error: null,
  registerSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegisterSuccess: (state) => {
      state.registerSuccess = false;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      setUser(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registerSuccess = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registerSuccess = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.loading = false;
      });
  },
});

export const { clearError, clearRegisterSuccess, updateUser } = authSlice.actions;
export default authSlice.reducer;

