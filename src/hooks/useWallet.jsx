import React, { useState, useCallback } from 'react';
import { useToast } from './useToast';
import {
  connectWallet as connectWalletService,
  disconnectWallet as disconnectWalletService,
  getActiveWallet,
  isWalletConnected,
  signTransaction as signTxService,
} from '../services/wallet';
import { WalletContext, SUPPORTED_WALLET_LIST } from '../context/WalletContext';

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState('');
  const [activeWallet, setActiveWallet] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  /**
   * Connects to a wallet.
   * If walletId is null/undefined, calls connectWalletService(null) which triggers
   * StellarWalletsKit.authModal().
   * If walletId is specified, connects directly to that wallet module and requests access.
   */
  const connect = useCallback(async (walletId = null) => {
    setIsConnecting(true);
    try {
      const res = await connectWalletService(walletId);
      setAddress(res.address);
      setActiveWallet(res.walletId);
      setIsModalOpen(false);
      if (addToast) addToast(`Connected to ${res.walletId}!`, 'success');
      return res;
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (addToast) addToast(err.message || 'Failed to connect wallet.', 'error');
      // Clean up local state on failure
      disconnectWalletService();
      setAddress('');
      setActiveWallet('');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [addToast]);

  /**
   * Disconnects current wallet and clears in-memory state completely.
   */
  const disconnect = useCallback(() => {
    disconnectWalletService();
    try {
      localStorage.removeItem('stellar_wallet_id');
      localStorage.removeItem('stellar_wallet_address');
    } catch {}
    setAddress('');
    setActiveWallet('');
    setIsModalOpen(false);
    if (addToast) addToast('Wallet disconnected successfully.', 'info');
  }, [addToast]);

  /**
   * Switches wallet session.
   * Disconnects current state, clears session, and opens wallet selection modal
   * or connects directly to newWalletId if provided.
   */
  const switchWallet = useCallback(async (newWalletId = null) => {
    disconnectWalletService();
    setAddress('');
    setActiveWallet('');

    if (newWalletId) {
      return await connect(newWalletId);
    } else {
      setIsModalOpen(true);
    }
  }, [connect]);

  /**
   * Signs a transaction XDR with the active wallet.
   */
  const signTransaction = async (xdr, opts) => {
    if (!isWalletConnected() && !address) {
      if (addToast) addToast('Wallet not connected', 'error');
      throw new Error('Wallet not connected');
    }
    try {
      const result = await signTxService(xdr, opts);
      return result;
    } catch (err) {
      if (addToast) addToast(err.message || 'Transaction signing failed', 'error');
      throw err;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        activeWallet,
        isConnecting,
        isConnected: Boolean(address),
        connect,
        disconnect,
        switchWallet,
        signTransaction,
        isModalOpen,
        setIsModalOpen,
        supportedWallets: SUPPORTED_WALLET_LIST,
        getActiveWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
