import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletSelectorModal = () => {
  const { isModalOpen, setIsModalOpen, connect, isConnecting, supportedWallets } = useWallet();

  if (!isModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => !isConnecting && setIsModalOpen(false)}>
      <div className="modal-content glass animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 style={{marginBottom: '1.5rem', textAlign: 'center'}}>Connect Wallet</h2>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem'}}>
          {supportedWallets.map(wallet => (
            <button 
              key={wallet.id}
              className="btn btn-outline" 
              onClick={() => connect(wallet.id)}
              disabled={isConnecting}
              style={{justifyContent: 'space-between', textTransform: 'capitalize'}}
            >
              <span>{wallet.name}</span>
              {isConnecting && <span className="skeleton" style={{width: '20px', height: '20px', borderRadius: '50%'}}></span>}
            </button>
          ))}
        </div>

        <button className="btn btn-outline" style={{marginTop: '2rem', width: '100%', borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}} onClick={() => setIsModalOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WalletSelectorModal;
