import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard Component', () => {
  const mockIcon = <div data-testid="icon">Icon</div>;

  it('renders title and value correctly', () => {
    render(
      <StatCard
        title="Pressure"
        value="3.5"
        unit="bar"
        icon={mockIcon}
      />
    );

    expect(screen.getByText('Pressure')).toBeInTheDocument();
    expect(screen.getByText('3.5')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('renders without unit when not provided', () => {
    render(
      <StatCard
        title="Efficiency"
        value="85%"
        icon={mockIcon}
      />
    );

    expect(screen.getByText('Efficiency')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders icon correctly', () => {
    render(
      <StatCard
        title="Temperature"
        value="20"
        icon={mockIcon}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies custom color', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="100"
        color="primary.main"
        icon={mockIcon}
      />
    );

    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });
});

