const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Toast Context & Component
const useToastJs = `import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={\`toast glass toast-\${t.type} animate-slide-up\`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
`;
fs.writeFileSync(path.join(srcDir, 'hooks', 'useToast.js'), useToastJs);


// 2. Wallet Context
const useWalletJs = `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules, FREIGHTER_ID, XBULL_ID } from '@creit.tech/stellar-wallets-kit';
import { useToast } from './useToast';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState('');
  const [activeWallet, setActiveWallet] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [kit, setKit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Initialize the kit with all available modules
    const swk = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID, // default, will be overridden
      modules: allowAllModules(),
    });
    setKit(swk);

    // Attempt to auto-reconnect
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
      connect(savedWallet, swk);
    }
  }, []);

  const connect = async (walletId, swkInstance = kit) => {
    if (!swkInstance) return;
    setIsConnecting(true);
    try {
      swkInstance.setWallet(walletId);
      const res = await swkInstance.getAddress();
      setAddress(res.address);
      setActiveWallet(walletId);
      localStorage.setItem('connectedWallet', walletId);
      setIsModalOpen(false);
      addToast('Wallet connected successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to connect wallet.', 'error');
      disconnect(); // cleanup
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = useCallback(() => {
    setAddress('');
    setActiveWallet('');
    localStorage.removeItem('connectedWallet');
    addToast('Wallet disconnected', 'info');
  }, [addToast]);

  const signTransaction = async (xdr) => {
    if (!kit || !address) {
      addToast('Wallet not connected', 'error');
      throw new Error('Wallet not connected');
    }
    try {
      const result = await kit.signTransaction(xdr);
      return result;
    } catch (err) {
      addToast('Transaction signing rejected or failed', 'error');
      throw err;
    }
  };

  return (
    <WalletContext.Provider value={{
      address,
      activeWallet,
      isConnecting,
      connect,
      disconnect,
      signTransaction,
      isModalOpen,
      setIsModalOpen,
      supportedWallets: kit ? kit.getSupportedWallets() : []
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
`;
fs.writeFileSync(path.join(srcDir, 'hooks', 'useWallet.js'), useWalletJs);


// 3. WalletSelectorModal Component
const modalJsx = `import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { FREIGHTER_ID, XBULL_ID } from '@creit.tech/stellar-wallets-kit';

const WalletSelectorModal = () => {
  const { isModalOpen, setIsModalOpen, connect, isConnecting, supportedWallets } = useWallet();

  if (!isModalOpen) return null;

  const handleConnect = (id) => {
    connect(id);
  };

  return (
    <div className="modal-backdrop" onClick={() => !isConnecting && setIsModalOpen(false)}>
      <div className="modal-content glass animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 style={{marginBottom: '1.5rem', textAlign: 'center'}}>Connect Wallet</h2>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <button 
            className="btn btn-outline" 
            onClick={() => handleConnect(FREIGHTER_ID)}
            disabled={isConnecting}
            style={{justifyContent: 'space-between'}}
          >
            <span>Freighter</span>
            {isConnecting && <span className="skeleton" style={{width: '20px', height: '20px', borderRadius: '50%'}}></span>}
          </button>
          
          <button 
            className="btn btn-outline" 
            onClick={() => handleConnect(XBULL_ID)}
            disabled={isConnecting}
            style={{justifyContent: 'space-between'}}
          >
            <span>xBull</span>
            {isConnecting && <span className="skeleton" style={{width: '20px', height: '20px', borderRadius: '50%'}}></span>}
          </button>
        </div>

        <button className="btn btn-outline" style={{marginTop: '2rem', width: '100%', borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}} onClick={() => setIsModalOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WalletSelectorModal;
`;
fs.writeFileSync(path.join(srcDir, 'components', 'WalletSelectorModal.jsx'), modalJsx);


// 4. Update WalletButton
const walletButtonJsx = `import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletButton = () => {
  const { address, isConnecting, disconnect, setIsModalOpen } = useWallet();

  if (isConnecting) {
    return (
      <button className="btn btn-outline" disabled>
        Connecting...
      </button>
    );
  }

  if (address) {
    const truncated = \`\${address.substring(0, 5)}...\${address.substring(address.length - 4)}\`;
    return (
      <div style={{position: 'relative', display: 'inline-block'}}>
        <button className="btn btn-outline" onClick={disconnect} title="Click to disconnect">
          {truncated}
        </button>
      </div>
    );
  }

  return (
    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ animation: 'pulse-glow 2s infinite' }}>
      Connect Wallet
    </button>
  );
};

export default WalletButton;
`;
fs.writeFileSync(path.join(srcDir, 'components', 'WalletButton.jsx'), walletButtonJsx);

// 5. Update App.jsx
const appJsx = `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { WalletProvider } from './hooks/useWallet';
import WalletSelectorModal from './components/WalletSelectorModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import NotFound from './pages/NotFound';

import './styles/globals.css';
import './styles/variables.css';
import './styles/animations.css';
import './styles/components.css';

function App() {
  return (
    <ToastProvider>
      <WalletProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <WalletSelectorModal />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
                <Route path="/campaign/:id" element={<CampaignDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </WalletProvider>
    </ToastProvider>
  );
}

export default App;
`;
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsx);

// 6. Update CSS
const cssUpdate = `

/* Modal */
.modal-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-content {
  width: 90%; max-width: 400px; padding: 2rem; background: var(--bg-dark);
}

/* Toasts */
.toast-container {
  position: fixed; bottom: 2rem; right: 2rem; display: flex; flex-direction: column; gap: 1rem; z-index: 3000;
}
.toast {
  padding: 1rem 1.5rem; font-weight: 500; min-width: 250px;
}
.toast-error { border-left: 4px solid #ef4444; }
.toast-success { border-left: 4px solid #10b981; }
.toast-info { border-left: 4px solid var(--accent-cyan); }
`;
fs.appendFileSync(path.join(srcDir, 'styles', 'components.css'), cssUpdate);

console.log("Wallet integration code written successfully.");
