import { render, screen } from '@testing-library/react';
import DonationSuccessModal from '../components/DonationSuccessModal';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('DonationSuccessModal', () => {
  const mockDonation = {
    hash: '45a651b8ccf7671cdc22d51a04f4ea2f99d2ecbb6ff3c0739cffcead1909f58e',
    status: 'SUCCESS',
    ledger: 123456,
    timestamp: '2026-08-13 20:00:00',
    amountXLM: '50',
    campaignTitle: 'Save the Oceans',
    donorAddress: 'GBRPYHIL2CI3FNQ4BXLFMNDLFPPPU2HY5P2K76IHNCHJK2C5K2K32K32',
    explorerUrl: 'https://stellar.expert/explorer/testnet/tx/45a651b8ccf7671cdc22d51a04f4ea2f99d2ecbb6ff3c0739cffcead1909f58e',
  };

  it('renders modal with donation details', () => {
    const handleClose = vi.fn();
    render(<DonationSuccessModal donation={mockDonation} onClose={handleClose} />);

    expect(screen.getByText('Donation Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('50 XLM')).toBeInTheDocument();
    expect(screen.getByText('Save the Oceans')).toBeInTheDocument();
    expect(screen.getByText('View on Stellar Expert')).toBeInTheDocument();
  });

  it('returns null when donation prop is null', () => {
    const { container } = render(<DonationSuccessModal donation={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
