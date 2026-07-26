import React from 'react';
import CampaignCard from '../components/CampaignCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Dashboard = () => {
  useDocumentTitle('Dashboard');
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h2 className="section-title" style={{ marginTop: '2rem' }}>Dashboard</h2>
      
      <div className="dashboard-grid">
        <aside>
          <div className="glass wallet-card">
            <h3>Your Wallet</h3>
            <div className="wallet-address">GABC...XYZ123</div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Balance: </span>
              <strong style={{ fontSize: '1.2rem' }}>5,230 XLM</strong>
            </div>
            <button className="btn btn-outline" style={{width: '100%'}}>Disconnect</button>
          </div>
        </aside>
        
        <main>
          <h3 style={{ marginBottom: '1rem' }}>Your Campaigns</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <CampaignCard 
              id={99} title="My Awesome Project" desc="This is my project." 
              raised={200} goal={1000} daysLeft={22} 
            />
             <div className="glass campaign-card" style={{ display: 'flex', alignItems: 'center', justify: 'center', minHeight: '300px' }}>
                <span style={{ color: 'var(--text-muted)' }}>+ Create New</span>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
