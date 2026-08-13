import React from 'react';

const Footer = () => {
  return (
    <footer className="glass-panel footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '1rem 5%' }}>
      <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} StellarFund. Master Level 3 Architecture.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }} />
        <span>Stellar Testnet Connected</span>
      </div>
    </footer>
  );
};

export default Footer;
