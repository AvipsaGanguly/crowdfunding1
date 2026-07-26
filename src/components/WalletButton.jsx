import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletButton = () => {
  const { address, isConnecting, disconnect, setIsModalOpen } = useWallet();

  if (isConnecting) {
    return (
      <button className="btn btn-outline" aria-label="Wallet connected: ${address.slice(0, 4)}..." tabIndex={0} disabled>
        Connecting...
      </button>
    );
  }

  if (address) {
    const truncated = `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
    return (
      <div style={{position: 'relative', display: 'inline-block'}}>
        <button className="btn btn-outline" onClick={disconnect} title="Click to disconnect">
          {truncated}
        </button>
      </div>
    );
  }

  return (
    <button className="btn btn-primary" aria-label="Connect your Stellar Wallet" onClick={() => setIsModalOpen(true)} style={{ animation: 'pulse-glow 2s infinite' }}>
      Connect Wallet
    </button>
  );
};

export default WalletButton;
