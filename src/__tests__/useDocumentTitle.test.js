import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { describe, it, expect, beforeEach } from 'vitest';

describe('useDocumentTitle', () => {
  beforeEach(() => {
    document.title = 'Default Title';
  });

  it('updates document title with page prefix', () => {
    renderHook(() => useDocumentTitle('Dashboard'));
    expect(document.title).toBe('Dashboard | StellarFund');
  });

  it('restores original title on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Create Campaign'));
    expect(document.title).toBe('Create Campaign | StellarFund');
    unmount();
    expect(document.title).toBe('Default Title');
  });
});
