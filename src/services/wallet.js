/**
 * @file src/services/wallet.js
 * @description Wallet service for Stellar Journey Crowdfunding (Level 3 Master).
 * Manages Stellar wallet connections (Freighter, xBull, Albedo, Lobstr, Rabet) using @creit.tech/stellar-wallets-kit,
 * providing connection persistence, automatic session restoration, transaction signing, and descriptive error handling.
 */

import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet';

// LocalStorage Keys for persistence
const STORAGE_KEY_WALLET_ID = 'stellar_connected_wallet_id';
const STORAGE_KEY_ADDRESS = 'stellar_connected_wallet_address';

// Supported wallet identifiers
export const SUPPORTED_WALLETS = {
  FREIGHTER: 'freighter',
  XBULL: 'xbull',
  ALBEDO: 'albedo',
  LOBSTR: 'lobstr',
  RABET: 'rabet',
};

// Singleton instance of StellarWalletsKit
let kitInstance = null;

// In-memory active session state
let activeWalletId = null;
let activeAddress = null;

/**
 * Lazy initialization of the StellarWalletsKit instance.
 * Equips support for Freighter, xBull, Albedo, Lobstr, and Rabet.
 * 
 * @returns {StellarWalletsKit} Configured StellarWalletsKit instance
 */
function getKitInstance() {
  if (!kitInstance) {
    kitInstance = new StellarWalletsKit({
      network: Networks.TESTNET,
      selectedWalletId: SUPPORTED_WALLETS.FREIGHTER,
      modules: [
        new FreighterModule(),
        new xBullModule(),
        new AlbedoModule(),
        new LobstrModule(),
        new RabetModule(),
      ],
    });
  }
  return kitInstance;
}

/**
 * Checks if a given wallet identifier is supported by the kit.
 * 
 * @param {string} walletId - The ID of the wallet to check
 * @returns {boolean} True if supported
 */
function isSupportedWallet(walletId) {
  if (!walletId) return false;
  return Object.values(SUPPORTED_WALLETS).includes(walletId.toLowerCase());
}

/**
 * Automatically restores a previously saved wallet session from localStorage.
 * 
 * @returns {Object|null} Active session details or null if no saved session
 */
export function restoreWallet() {
  try {
    const savedWalletId = typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(STORAGE_KEY_WALLET_ID)
      : null;
    const savedAddress = typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(STORAGE_KEY_ADDRESS)
      : null;

    if (savedWalletId && savedAddress && isSupportedWallet(savedWalletId)) {
      activeWalletId = savedWalletId;
      activeAddress = savedAddress;
      getKitInstance().setWallet(savedWalletId);
      return {
        walletId: activeWalletId,
        address: activeAddress,
        isConnected: true,
      };
    }
  } catch (error) {
    console.warn('Failed to restore wallet session from localStorage:', error);
  }
  return null;
}

/**
 * Connects to the specified Stellar wallet.
 * Supports Freighter, xBull, and other kit-supported wallets.
 * Handles missing extension, user rejections, and unsupported wallet errors.
 * 
 * @param {string} [walletId='freighter'] - Wallet identifier to connect to
 * @returns {Promise<{walletId: string, address: string, isConnected: boolean}>} Connected wallet details
 * @throws {Error} Descriptive error on connection failure
 */
export async function connectWallet(walletId = SUPPORTED_WALLETS.FREIGHTER) {
  const normalizedWalletId = walletId ? walletId.toLowerCase() : SUPPORTED_WALLETS.FREIGHTER;

  // Validate wallet support
  if (!isSupportedWallet(normalizedWalletId)) {
    throw new Error(
      `Unsupported wallet '${walletId}'. Supported wallets are: ${Object.values(SUPPORTED_WALLETS).join(', ')}.`
    );
  }

  const kit = getKitInstance();

  try {
    // Set active module in StellarWalletsKit
    kit.setWallet(normalizedWalletId);

    // Request account address from wallet
    const result = await kit.getAddress();
    const address = result?.address || result;

    if (!address || typeof address !== 'string') {
      throw new Error(`Failed to retrieve a valid public address from ${normalizedWalletId}.`);
    }

    // Persist active session
    activeWalletId = normalizedWalletId;
    activeAddress = address;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_WALLET_ID, normalizedWalletId);
      localStorage.setItem(STORAGE_KEY_ADDRESS, address);
    }

    return {
      walletId: activeWalletId,
      address: activeAddress,
      isConnected: true,
    };
  } catch (error) {
    // Standardize & handle specific error scenarios with descriptive messages
    const errorMsg = error?.message || String(error);
    const lowerMsg = errorMsg.toLowerCase();

    if (
      lowerMsg.includes('not installed') ||
      lowerMsg.includes('not found') ||
      lowerMsg.includes('missing') ||
      lowerMsg.includes('is not available')
    ) {
      throw new Error(
        `The ${normalizedWalletId} wallet extension is not installed or unavailable in your browser.`
      );
    }

    if (
      lowerMsg.includes('reject') ||
      lowerMsg.includes('user denied') ||
      lowerMsg.includes('cancelled') ||
      lowerMsg.includes('canceled') ||
      lowerMsg.includes('declined')
    ) {
      throw new Error(`Wallet connection request was rejected by the user.`);
    }

    throw new Error(`Failed to connect to ${normalizedWalletId} wallet: ${errorMsg}`);
  }
}

/**
 * Disconnects the currently active Stellar wallet and purges localStorage persistence.
 * 
 * @returns {boolean} True if successfully disconnected
 */
export function disconnectWallet() {
  activeWalletId = null;
  activeAddress = null;

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY_WALLET_ID);
    localStorage.removeItem(STORAGE_KEY_ADDRESS);
  }

  return true;
}

/**
 * Checks if a wallet is currently connected.
 * 
 * @returns {boolean} True if connected
 */
export function isWalletConnected() {
  return Boolean(activeWalletId && activeAddress);
}

/**
 * Retrieves information about the currently active wallet session.
 * 
 * @returns {{walletId: string|null, address: string|null, isConnected: boolean}} Active wallet session
 */
export function getActiveWallet() {
  return {
    walletId: activeWalletId,
    address: activeAddress,
    isConnected: isWalletConnected(),
  };
}

/**
 * Signs a Stellar transaction envelope XDR using the active wallet.
 * Handles user rejections and missing connection state.
 * 
 * @param {string} xdr - Unsigned Stellar transaction envelope XDR string
 * @param {Object} [opts={}] - Optional parameters for transaction signing
 * @returns {Promise<any>} Signed transaction result from wallet kit
 * @throws {Error} Descriptive error if disconnected or signing fails
 */
export async function signTransaction(xdr, opts = {}) {
  if (!isWalletConnected()) {
    throw new Error('Wallet is disconnected. Please connect a wallet before signing transactions.');
  }

  if (!xdr || typeof xdr !== 'string') {
    throw new Error('Invalid XDR parameter provided for signing.');
  }

  const kit = getKitInstance();

  try {
    const signedResult = await kit.signTransaction(xdr, opts);
    return signedResult;
  } catch (error) {
    const errorMsg = error?.message || String(error);
    const lowerMsg = errorMsg.toLowerCase();

    if (
      lowerMsg.includes('reject') ||
      lowerMsg.includes('user denied') ||
      lowerMsg.includes('declined') ||
      lowerMsg.includes('cancelled') ||
      lowerMsg.includes('canceled')
    ) {
      throw new Error('Transaction signing request was rejected by the user.');
    }

    if (lowerMsg.includes('disconnected') || lowerMsg.includes('session expired')) {
      disconnectWallet();
      throw new Error('Wallet connection session expired or disconnected.');
    }

    throw new Error(`Failed to sign transaction: ${errorMsg}`);
  }
}

// Automatically attempt to restore wallet session on module import
restoreWallet();
