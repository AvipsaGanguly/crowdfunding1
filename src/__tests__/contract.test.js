import { describe, it, expect } from 'vitest';
import { getContractAddresses } from '../services/contract';

describe('contract service helpers', () => {
  it('returns valid contract address configuration', () => {
    const config = getContractAddresses();
    expect(config.campaignManager).toBeDefined();
    expect(config.donationManager).toBeDefined();
    expect(config.rpcUrl).toContain('stellar.org');
  });
});
