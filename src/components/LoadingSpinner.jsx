import React from 'react';

export const LoadingSkeleton = ({ height = '200px', width = '100%', borderRadius = '12px' }) => {
  return (
    <div className="skeleton" style={{ height, width, borderRadius }}></div>
  );
};

const LoadingSpinner = ({ label = 'Processing transaction on Stellar Testnet...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '1rem'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: 'var(--primary-color, #00f2fe)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{
        color: '#94a3b8',
        fontSize: '0.9rem',
        fontWeight: 500
      }}>
        {label}
      </span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
