import { describe, it, expect } from 'vitest';
import {
  STROOPS_PER_XLM,
  MIN_DONATION_AMOUNT_XLM,
  MAX_DONATION_AMOUNT_XLM,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
} from '../utils/constants';

describe('constants.js', () => {
  it('exports valid STROOPS_PER_XLM scale factor', () => {
    expect(STROOPS_PER_XLM).toBe(10000000);
  });

  it('defines valid donation amount bounds', () => {
    expect(MIN_DONATION_AMOUNT_XLM).toBe(0.1);
    expect(MAX_DONATION_AMOUNT_XLM).toBe(100000);
    expect(MIN_DONATION_AMOUNT_XLM).toBeLessThan(MAX_DONATION_AMOUNT_XLM);
  });

  it('defines valid title character bounds', () => {
    expect(MIN_TITLE_LENGTH).toBe(3);
    expect(MAX_TITLE_LENGTH).toBe(100);
  });
});
