import { render, screen } from '@testing-library/react';
import StatsCard from '../components/StatsCard';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('StatsCard', () => {
  it('renders label and formatted value', () => {
    render(<StatsCard label="Active Projects" value="12" />);
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
