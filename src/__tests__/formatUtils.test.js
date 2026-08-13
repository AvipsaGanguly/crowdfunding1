import { describe, it, expect } from 'vitest';
import { truncateAddress, stroopsToXlm } from '../utils/format';

describe('format utilities', () => {
  it('truncates valid Stellar address with defaults', () => {
    const address = 'CAPFOLYX5LZRFZZUPV374HOEXGLIA7QN3SR5SHA5V75W6PBZBK4KM52V';
    const result = truncateAddress(address);
    expect(result).toBe('CAPFOL...4KM52V');
  });

  it('handles null or non-string address gracefully', () => {
    expect(truncateAddress(null)).toBe('N/A');
    expect(truncateAddress(undefined)).toBe('N/A');
    expect(truncateAddress(12345)).toBe('N/A');
  });

  it('returns short address unchanged', () => {
    expect(truncateAddress('SHORT')).toBe('SHORT');
  });

  it('converts stroops to XLM correctly', () => {
    expect(stroopsToXlm(100_000_000)).toBe('10');
    expect(stroopsToXlm(5_000_000)).toBe('0.5');
    expect(stroopsToXlm(0)).toBe('0');
  });
});
