import { describe, it, expect } from 'vitest';
import { getContractAddresses } from '../services/contract';

describe('contract service helpers', () => {
  it('returns valid contract address configuration', () => {
    const config = getContractAddresses();
    expect(config.campaignManager).toBeDefined();
    expect(config.donationManager).toBeDefined();
    expect(config.rpcUrl).toContain('stellar.org');
  });

  it('ensures contract addresses are non-empty strings', () => {
    const config = getContractAddresses();
    expect(typeof config.campaignManager).toBe('string');
    expect(config.campaignManager.length).toBeGreaterThan(10);
    expect(typeof config.donationManager).toBe('string');
    expect(config.donationManager.length).toBeGreaterThan(10);
  });

  it('includes default Stellar Testnet network passphrase', () => {
    const config = getContractAddresses();
    expect(config.networkPassphrase).toContain('Test SDF Network');
  });
});
