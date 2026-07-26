import { describe, it, expect, beforeEach, vi } from 'vitest';

let mockShouldReject = false;

// Properly mock StellarWalletsKit as a constructor function
vi.mock('@creit.tech/stellar-wallets-kit', () => {
  let selectedWallet = 'freighter';
  
  function MockStellarWalletsKit() {
    this.setWallet = vi.fn((walletId) => {
      selectedWallet = walletId;
    });
    this.getAddress = vi.fn(async () => {
      if (mockShouldReject) {
        throw new Error('User denied wallet connection request');
      }
      return { address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF' };
    });
    this.signTransaction = vi.fn(async (xdr) => {
      if (xdr === 'INVALID_REJECT') {
        throw new Error('User cancelled transaction signing');
      }
      return { signedXdr: 'SIGNED_' + xdr };
    });
  }

  return {
    StellarWalletsKit: MockStellarWalletsKit,
    Networks: { TESTNET: 'Test SDF Network ; September 2015' },
  };
});

vi.mock('@creit.tech/stellar-wallets-kit/modules/freighter', () => ({ FreighterModule: function() {} }));
vi.mock('@creit.tech/stellar-wallets-kit/modules/xbull', () => ({ xBullModule: function() {} }));
vi.mock('@creit.tech/stellar-wallets-kit/modules/albedo', () => ({ AlbedoModule: function() {} }));
vi.mock('@creit.tech/stellar-wallets-kit/modules/lobstr', () => ({ LobstrModule: function() {} }));
vi.mock('@creit.tech/stellar-wallets-kit/modules/rabet', () => ({ RabetModule: function() {} }));

import {
  connectWallet,
  disconnectWallet,
  getActiveWallet,
  isWalletConnected,
  signTransaction,
  restoreWallet,
  SUPPORTED_WALLETS,
} from '../services/wallet';

describe('wallet.js Service', () => {
  beforeEach(() => {
    localStorage.clear();
    disconnectWallet();
    mockShouldReject = false;
  });

  it('connects to Freighter wallet successfully and persists to localStorage', async () => {
    const result = await connectWallet(SUPPORTED_WALLETS.FREIGHTER);
    expect(result.isConnected).toBe(true);
    expect(result.walletId).toBe('freighter');
    expect(result.address).toBe('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');

    expect(isWalletConnected()).toBe(true);
    expect(getActiveWallet()).toEqual({
      walletId: 'freighter',
      address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      isConnected: true,
    });
    expect(localStorage.getItem('stellar_connected_wallet_id')).toBe('freighter');
  });

  it('connects to xBull wallet successfully', async () => {
    const result = await connectWallet(SUPPORTED_WALLETS.XBULL);
    expect(result.isConnected).toBe(true);
    expect(result.walletId).toBe('xbull');
  });

  it('throws descriptive error for unsupported wallet', async () => {
    await expect(connectWallet('metamask')).rejects.toThrow(/Unsupported wallet/);
  });

  it('throws descriptive error when wallet connection is rejected', async () => {
    mockShouldReject = true;
    await expect(connectWallet(SUPPORTED_WALLETS.FREIGHTER)).rejects.toThrow(/rejected by the user/);
  });

  it('disconnects wallet and clears localStorage', async () => {
    await connectWallet(SUPPORTED_WALLETS.FREIGHTER);
    expect(isWalletConnected()).toBe(true);

    disconnectWallet();
    expect(isWalletConnected()).toBe(false);
    expect(getActiveWallet().isConnected).toBe(false);
    expect(localStorage.getItem('stellar_connected_wallet_id')).toBeNull();
  });

  it('restores wallet connection automatically from localStorage', () => {
    localStorage.setItem('stellar_connected_wallet_id', 'freighter');
    localStorage.setItem('stellar_connected_wallet_address', 'GRESTOREDADDRESS12345');

    const restored = restoreWallet();
    expect(restored).toEqual({
      walletId: 'freighter',
      address: 'GRESTOREDADDRESS12345',
      isConnected: true,
    });
    expect(isWalletConnected()).toBe(true);
  });

  it('signs transaction when wallet is connected', async () => {
    await connectWallet(SUPPORTED_WALLETS.FREIGHTER);
    const res = await signTransaction('TEST_UNSIGNED_XDR');
    expect(res).toEqual({ signedXdr: 'SIGNED_TEST_UNSIGNED_XDR' });
  });

  it('throws error when trying to sign transaction without connected wallet', async () => {
    await expect(signTransaction('TEST_XDR')).rejects.toThrow(/Wallet is disconnected/);
  });

  it('throws descriptive error when user rejects transaction signature', async () => {
    await connectWallet(SUPPORTED_WALLETS.FREIGHTER);
    await expect(signTransaction('INVALID_REJECT')).rejects.toThrow(/rejected by the user/);
  });
});
