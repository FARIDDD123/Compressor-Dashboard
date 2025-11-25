// src/features/auth/authSlice.test.js

import authReducer, {
  loginUser,
  logoutUser,
  clearError,
  updateUser,
} from './authSlice';

describe('authSlice', () => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    registerSuccess: false,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(
      expect.objectContaining({
        isAuthenticated: false,
        loading: false,
        error: null,
      })
    );
  });

  it('should handle loginUser.pending', () => {
    const action = { type: loginUser.pending.type };
    const state = authReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle loginUser.fulfilled', () => {
    const mockPayload = {
      token: 'test-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      },
    };
    const action = { type: loginUser.fulfilled.type, payload: mockPayload };
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockPayload.user);
    expect(state.token).toBe(mockPayload.token);
    expect(state.error).toBe(null);
  });

  it('should handle loginUser.rejected', () => {
    const action = {
      type: loginUser.rejected.type,
      payload: 'Invalid credentials',
    };
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.error).toBe('Invalid credentials');
  });

  it('should handle logoutUser.fulfilled', () => {
    const loggedInState = {
      isAuthenticated: true,
      user: { id: 1, username: 'testuser' },
      token: 'test-token',
      loading: false,
      error: null,
      registerSuccess: false,
    };
    const action = { type: logoutUser.fulfilled.type };
    const state = authReducer(loggedInState, action);
    
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.loading).toBe(false);
  });

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error',
    };
    const state = authReducer(stateWithError, clearError());
    expect(state.error).toBe(null);
  });

  it('should handle updateUser', () => {
    const updatedUser = {
      id: 1,
      username: 'updateduser',
      email: 'updated@example.com',
      role: 'engineer',
    };
    const state = authReducer(initialState, updateUser(updatedUser));
    expect(state.user).toEqual(updatedUser);
  });
});

