import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../hooks/useWallet', () => ({
  useWallet: () => ({
    address: '',
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnecting: false,
    setIsModalOpen: vi.fn(),
  })
}));

describe('Navbar', () => {
  it('renders brand logo and navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('StellarFund')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });
});
