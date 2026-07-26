import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

describe('Dashboard', () => {
  it('renders dashboard sections', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByText(/Your Wallet/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Campaigns/i)).toBeInTheDocument();
  });
});
