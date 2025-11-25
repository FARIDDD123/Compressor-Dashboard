import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />);
    
    // Check if spinner element is present
    const spinner = screen.getByRole('progressbar', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });
});

