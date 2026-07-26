import React, { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import StatsCard from '../components/StatsCard';
import CampaignCard from '../components/CampaignCard';
import { fetchAllCampaigns } from '../services/campaign';
import { LoadingSkeleton } from '../components/LoadingSpinner';
import { useEvents } from '../hooks/useEvents';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Home = () => {
  useDocumentTitle('Home');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { events } = useEvents();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchAllCampaigns();
        setCampaigns(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-refresh logic via events
  useEffect(() => {
    if (events.length > 0) {
      const latest = events[0];
      if (latest.type === 'CampaignCreated' && !campaigns.find(c => c.id.toString() === latest.data.campaignId?.toString())) {
        // In a real app we would fetch the specific campaign ID here and prepend it.
        // For now, we trigger a soft reload to keep data consistent.
        fetchAllCampaigns().then(data => setCampaigns(data || []));
      }
    }
  }, [events]);

  return (
    <div className="animate-fade-in">
      <HeroSection />
      
      <div style={{ padding: '0 5%', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <StatsCard label="Active Projects" value={campaigns.length.toString()} />
        </div>
      </div>

      <h2 className="section-title">Trending Campaigns</h2>
      <div className="grid-container">
        {loading ? (
          <>
            <LoadingSkeleton height="350px" />
            <LoadingSkeleton height="350px" />
            <LoadingSkeleton height="350px" />
          </>
        ) : campaigns.length === 0 ? (
          <p style={{padding: '0 5%', color: 'var(--text-muted)'}}>No campaigns found yet.</p>
        ) : (
          campaigns.map(c => (
            <CampaignCard 
              key={c.id.toString()} 
              id={c.id.toString()}
              title={c.title.toString()} 
              desc={c.description.toString()} 
              raised={0} // To be fetched from DonationManager or derived
              goal={Number(c.goal) / 10000000} 
              daysLeft={Math.max(0, Math.floor((Number(c.deadline) - Date.now()/1000) / 86400))} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
