import { createContext, useContext } from 'react';

export const WalletContext = createContext();

export const SUPPORTED_WALLET_LIST = [
  { id: 'freighter', name: 'Freighter' },
  { id: 'xbull', name: 'xBull' },
  { id: 'albedo', name: 'Albedo' },
  { id: 'lobstr', name: 'Lobstr' },
  { id: 'rabet', name: 'Rabet' },
];

export const useWallet = () => useContext(WalletContext);
