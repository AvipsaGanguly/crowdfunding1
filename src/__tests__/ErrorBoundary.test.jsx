import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

const ProblemChild = () => {
  throw new Error('Test crash');
};

describe('ErrorBoundary', () => {
  it('catches component error and displays fallback UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred in the application view.')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
