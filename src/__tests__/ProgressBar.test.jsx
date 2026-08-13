import { render } from '@testing-library/react';
import ProgressBar from '../components/ProgressBar';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('ProgressBar', () => {
  it('renders progress bar with 50% width', () => {
    const { container } = render(<ProgressBar progress={50} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('clamps negative progress to 0%', () => {
    const { container } = render(<ProgressBar progress={-20} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('clamps overflow progress to 100%', () => {
    const { container } = render(<ProgressBar progress={150} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '100%' });
  });
});
