import { render, screen } from '@testing-library/react';
import CampaignCard from '../components/CampaignCard';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

describe('CampaignCard', () => {
  it('renders campaign card details and progress', () => {
    render(
      <BrowserRouter>
        <CampaignCard
          id="1"
          title="Save the Rainforest"
          desc="Planting 1 million trees"
          raised={500}
          goal={1000}
          daysLeft={14}
          category="Environment"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Save the Rainforest')).toBeInTheDocument();
    expect(screen.getByText('Planting 1 million trees')).toBeInTheDocument();
    expect(screen.getByText('500 XLM')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Environment')).toBeInTheDocument();
    expect(screen.getByText('14 days left')).toBeInTheDocument();
  });

  it('renders fallback when description is missing', () => {
    render(
      <BrowserRouter>
        <CampaignCard
          id="2"
          title="Minimal Campaign"
          desc=""
          raised={0}
          goal={100}
          daysLeft={5}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });
});
