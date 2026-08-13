import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletButton = () => {
  const { address, isConnecting, disconnect, switchWallet, setIsModalOpen } = useWallet();
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnecting) {
    return (
      <button className="btn btn-outline" disabled>
        Connecting...
      </button>
    );
  }

  if (address) {
    const truncated = `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;

    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleCopyAddress}
          className="btn btn-outline"
          title="Click to copy full wallet address"
          style={{
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            padding: '0.5rem 0.8rem',
            cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : truncated}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => switchWallet()}
          title="Disconnect current wallet and open wallet selector"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          Switch Wallet
        </button>
        <button
          className="btn btn-outline"
          onClick={disconnect}
          title="Disconnect current wallet session"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: '#ff4d4f', color: '#ff4d4f' }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-primary"
      aria-label="Connect your Stellar Wallet"
      onClick={() => setIsModalOpen(true)}
      style={{ animation: 'pulse-glow 2s infinite' }}
    >
      Connect Wallet
    </button>
  );
};

export default WalletButton;
