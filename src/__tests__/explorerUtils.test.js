import { describe, it, expect } from 'vitest';
import { getTxExplorerUrl, getContractExplorerUrl } from '../utils/explorer';

describe('explorer utilities', () => {
  it('generates valid transaction explorer URL', () => {
    const hash = '45a651b8ccf7671cdc22d51a04f4ea2f99d2ecbb6ff3c0739cffcead1909f58e';
    expect(getTxExplorerUrl(hash)).toBe(`https://stellar.expert/explorer/testnet/tx/${hash}`);
  });

  it('returns base URL when hash is empty', () => {
    expect(getTxExplorerUrl('')).toBe('https://stellar.expert/explorer/testnet');
    expect(getTxExplorerUrl(null)).toBe('https://stellar.expert/explorer/testnet');
    expect(getTxExplorerUrl(undefined)).toBe('https://stellar.expert/explorer/testnet');
  });

  it('generates valid contract explorer URL', () => {
    const address = 'CAPFOLYX5LZRFZZUPV374HOEXGLIA7QN3SR5SHA5V75W6PBZBK4KM52V';
    expect(getContractExplorerUrl(address)).toBe(`https://stellar.expert/explorer/testnet/contract/${address}`);
  });

  it('generates valid transaction explorer URL with whitespace trimming', () => {
    const hash = '  45a651b8ccf7671cdc22d51a04f4ea2f99d2ecbb6ff3c0739cffcead1909f58e  ';
    expect(getTxExplorerUrl(hash.trim())).toBe(`https://stellar.expert/explorer/testnet/tx/${hash.trim()}`);
  });

  it('returns base URL when contract address is empty', () => {
    expect(getContractExplorerUrl('')).toBe('https://stellar.expert/explorer/testnet');
    expect(getContractExplorerUrl(null)).toBe('https://stellar.expert/explorer/testnet');
    expect(getContractExplorerUrl(undefined)).toBe('https://stellar.expert/explorer/testnet');
  });
});
