// src/components/auth/ProtectedRoute.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from './ProtectedRoute';
import authReducer from '../../features/auth/authSlice';

const createMockStore = (authState) => {
  return configureStore({
    reducer: {
      auth: () => authState,
    },
  });
};

const renderWithRouter = (component, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    const mockStore = createMockStore({
      isAuthenticated: true,
      user: { id: 1, username: 'testuser', role: 'admin' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      mockStore
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading spinner when loading', () => {
    const mockStore = createMockStore({
      isAuthenticated: false,
      user: null,
      loading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      mockStore
    );

    // CircularProgress should be rendered (checking for loading state)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    const mockStore = createMockStore({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      mockStore
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should deny access when user lacks required role', () => {
    const mockStore = createMockStore({
      isAuthenticated: true,
      user: { id: 1, username: 'testuser', role: 'viewer' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requiredRoles={['admin', 'engineer']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      mockStore
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should allow access when user has required role', () => {
    const mockStore = createMockStore({
      isAuthenticated: true,
      user: { id: 1, username: 'testuser', role: 'admin' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requiredRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      mockStore
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});

