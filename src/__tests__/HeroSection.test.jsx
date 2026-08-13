import { render, screen } from '@testing-library/react';
import HeroSection from '../components/HeroSection';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

describe('HeroSection', () => {
  it('renders hero title and action links', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    expect(screen.getByText(/Fuel the Future with/i)).toBeInTheDocument();
    expect(screen.getByText('Start a Campaign')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });
});
