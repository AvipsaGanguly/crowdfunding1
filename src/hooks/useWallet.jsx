import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';
import {
  connectWallet as connectWalletService,
  disconnectWallet as disconnectWalletService,
  getActiveWallet,
  isWalletConnected,
  signTransaction as signTxService,
  restoreWallet,
  SUPPORTED_WALLETS,
} from '../services/wallet';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState('');
  const [activeWallet, setActiveWallet] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  // Attempt auto-restoration on initial mount
  useEffect(() => {
    const session = restoreWallet();
    if (session && session.isConnected) {
      setAddress(session.address);
      setActiveWallet(session.walletId);
    }
  }, []);

  const connect = async (walletId = SUPPORTED_WALLETS.FREIGHTER) => {
    setIsConnecting(true);
    try {
      const res = await connectWalletService(walletId);
      setAddress(res.address);
      setActiveWallet(res.walletId);
      setIsModalOpen(false);
      if (addToast) addToast('Wallet connected successfully!', 'success');
      return res;
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (addToast) addToast(err.message || 'Failed to connect wallet.', 'error');
      disconnect(); // Cleanup local state on failure
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = useCallback(() => {
    disconnectWalletService();
    setAddress('');
    setActiveWallet('');
    if (addToast) addToast('Wallet disconnected', 'info');
  }, [addToast]);

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
        signTransaction,
        isModalOpen,
        setIsModalOpen,
        supportedWallets: Object.values(SUPPORTED_WALLETS),
        getActiveWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
