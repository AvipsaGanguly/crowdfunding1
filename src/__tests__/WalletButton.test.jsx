import { render, screen } from '@testing-library/react';
import WalletButton from '../components/WalletButton';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock the hook to avoid importing the troublesome stellar-wallets-kit in Node
vi.mock('../hooks/useWallet', () => ({
  useWallet: () => ({
    address: '',
    isConnecting: false,
    disconnect: vi.fn(),
    setIsModalOpen: vi.fn()
  })
}));

describe('WalletButton', () => {
  it('renders Connect Wallet initially', () => {
    render(<WalletButton />);
    expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
  });
});
