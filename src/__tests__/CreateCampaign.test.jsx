import { render, screen } from '@testing-library/react';
import CreateCampaign from '../pages/CreateCampaign';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('../hooks/useTransaction', () => ({
  useTransaction: () => ({
    execute: vi.fn(),
    isPending: false
  })
}));

vi.mock('../services/campaign', () => ({
  buildCreateCampaignTx: vi.fn(),
}));

describe('CreateCampaign', () => {
  it('renders campaign creation form', () => {
    render(<CreateCampaign />);
    expect(screen.getByPlaceholderText(/Campaign Title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Goal \(XLM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit Campaign/i)).toBeInTheDocument();
  });
});
