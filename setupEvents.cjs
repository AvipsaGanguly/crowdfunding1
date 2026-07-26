const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Event Service
const eventServiceJs = `import { server } from './contract';
import { scValToNative } from '@stellar/stellar-sdk';

const DONATION_MANAGER_ID = import.meta.env.VITE_DONATION_MANAGER_ID;
const CAMPAIGN_MANAGER_ID = import.meta.env.VITE_CAMPAIGN_MANAGER_ID;

/**
 * Poll the Soroban RPC for new events since a specific ledger.
 */
export const fetchRecentEvents = async (startLedger) => {
  try {
    const filters = [];
    if (DONATION_MANAGER_ID && DONATION_MANAGER_ID !== 'CBPLACEHOLDER_DONATION_MANAGER_ADDRESS_THAT_NEEDS_UPDATING') {
      filters.push({
        type: "contract",
        contractIds: [DONATION_MANAGER_ID],
        topics: [["*"]]
      });
    }
    
    if (CAMPAIGN_MANAGER_ID && CAMPAIGN_MANAGER_ID !== 'CBPLACEHOLDER_CAMPAIGN_MANAGER_ADDRESS_THAT_NEEDS_UPDATING') {
      filters.push({
        type: "contract",
        contractIds: [CAMPAIGN_MANAGER_ID],
        topics: [["*"]]
      });
    }

    if (filters.length === 0) return { events: [], latestLedger: startLedger };

    const response = await server.getEvents({
      startLedger,
      filters,
      limit: 50
    });

    const parsedEvents = response.events.map(evt => {
      // Decode XDR topics & data
      // For a real app, you would parse the specific topics matching your contract
      // e.g. Topic[0] == symbol_short("donate")
      let type = 'Unknown';
      let parsedData = {};

      try {
        const topic0 = evt.topic[0] ? scValToNative(evt.topic[0]) : '';
        if (topic0 === 'donate' || topic0 === 'DonationReceived') {
          type = 'DonationReceived';
          // mock parsing for demo until contracts emit exact shaped data
          parsedData = { amount: scValToNative(evt.value), campaignId: scValToNative(evt.topic[1]) };
        } else if (topic0 === 'campaign_created') {
          type = 'CampaignCreated';
          parsedData = { campaignId: scValToNative(evt.topic[1]) };
        }
      } catch (e) {
        // Fallback for demo parsing
        type = 'GenericEvent';
      }

      return {
        id: evt.id,
        type,
        ledger: evt.ledger,
        contractId: evt.contractId,
        data: parsedData,
        raw: evt
      };
    });

    return { 
      events: parsedEvents, 
      latestLedger: response.latestLedger > startLedger ? response.latestLedger : startLedger 
    };

  } catch (error) {
    console.error("Failed to fetch events:", error);
    return { events: [], latestLedger: startLedger };
  }
};
`;
fs.writeFileSync(path.join(srcDir, 'services', 'eventService.js'), eventServiceJs);


// 2. Global Event Hook Context
const useEventsJsx = `import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fetchRecentEvents } from '../services/eventService';
import { server } from '../services/contract';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const lastLedgerRef = useRef(0);
  const [isPolling, setIsPolling] = useState(false);

  // Initial Sync to get the current ledger
  useEffect(() => {
    const init = async () => {
      try {
        const latest = await server.getLatestLedger();
        lastLedgerRef.current = latest.sequence;
        setIsPolling(true);
      } catch (err) {
        console.error("Failed to get latest ledger", err);
        // Default fallback
        setIsPolling(true);
      }
    };
    init();
  }, []);

  // Polling Loop
  useEffect(() => {
    if (!isPolling) return;

    let intervalId;
    const poll = async () => {
      if (lastLedgerRef.current === 0) return;
      const res = await fetchRecentEvents(lastLedgerRef.current + 1);
      
      if (res.events && res.events.length > 0) {
        setEvents(prev => {
          // Keep only the last 20 events in memory to prevent bloat
          const combined = [...res.events, ...prev];
          return combined.slice(0, 20);
        });
      }
      lastLedgerRef.current = res.latestLedger;
    };

    intervalId = setInterval(poll, 7000); // Poll every 7 seconds
    return () => clearInterval(intervalId);
  }, [isPolling]);

  const addOptimisticEvent = useCallback((event) => {
    setEvents(prev => [event, ...prev].slice(0, 20));
  }, []);

  return (
    <EventContext.Provider value={{ events, addOptimisticEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
`;
fs.writeFileSync(path.join(srcDir, 'hooks', 'useEvents.jsx'), useEventsJsx);


// 3. LiveFeed Component
const liveFeedJsx = `import React from 'react';
import { useEvents } from '../hooks/useEvents';

const LiveFeed = () => {
  const { events } = useEvents();

  const renderEventMessage = (evt) => {
    if (evt.type === 'DonationReceived') {
      return \`🎉 Someone donated \${Number(evt.data.amount) / 10000000} XLM to Campaign #\${evt.data.campaignId}\`;
    }
    if (evt.type === 'CampaignCreated') {
      return \`🚀 New Campaign Created: #\${evt.data.campaignId}\`;
    }
    return \`⚡ Smart Contract Event Emitted\`;
  };

  // Only show the 3 most recent events
  const displayEvents = events.slice(0, 3);

  if (displayEvents.length === 0) return null;

  return (
    <div className="live-feed-container glass">
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
        🔴 Live Feed
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {displayEvents.map((evt, idx) => (
          <div key={evt.id || idx} className="live-feed-item animate-slide-up">
            {renderEventMessage(evt)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;
`;
fs.writeFileSync(path.join(srcDir, 'components', 'LiveFeed.jsx'), liveFeedJsx);


// 4. Update App.jsx to include EventProvider and LiveFeed
let appJsx = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf8');
appJsx = appJsx.replace("import { WalletProvider } from './hooks/useWallet';", "import { WalletProvider } from './hooks/useWallet';\nimport { EventProvider } from './hooks/useEvents';\nimport LiveFeed from './components/LiveFeed';");
appJsx = appJsx.replace("<WalletProvider>", "<WalletProvider>\n        <EventProvider>");
appJsx = appJsx.replace("</WalletProvider>", "        </EventProvider>\n      </WalletProvider>");
appJsx = appJsx.replace("<WalletSelectorModal />", "<WalletSelectorModal />\n            <LiveFeed />");
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsx);


// 5. Update Home.jsx to react to CampaignCreated events dynamically
let homeJsx = fs.readFileSync(path.join(srcDir, 'pages', 'Home.jsx'), 'utf8');
homeJsx = homeJsx.replace("import { LoadingSkeleton } from '../components/LoadingSpinner';", "import { LoadingSkeleton } from '../components/LoadingSpinner';\nimport { useEvents } from '../hooks/useEvents';");
homeJsx = homeJsx.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n  const { events } = useEvents();");
homeJsx = homeJsx.replace("  }, []);", `  }, []);\n\n  // Auto-refresh logic via events\n  useEffect(() => {\n    if (events.length > 0) {\n      const latest = events[0];\n      if (latest.type === 'CampaignCreated' && !campaigns.find(c => c.id.toString() === latest.data.campaignId?.toString())) {\n        // In a real app we would fetch the specific campaign ID here and prepend it.\n        // For now, we trigger a soft reload to keep data consistent.\n        fetchAllCampaigns().then(data => setCampaigns(data || []));\n      }\n    }\n  }, [events]);`);
fs.writeFileSync(path.join(srcDir, 'pages', 'Home.jsx'), homeJsx);


// 6. Update CSS for LiveFeed
const cssUpdates = `
.live-feed-container {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 300px;
  padding: 1rem;
  border-radius: var(--radius-md);
  z-index: 1000;
  pointer-events: none;
}

.live-feed-item {
  font-size: 0.9rem;
  color: var(--text-main);
  background: rgba(255,255,255,0.05);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--accent-cyan);
}
`;
fs.appendFileSync(path.join(srcDir, 'styles', 'components.css'), cssUpdates);

console.log("Real-time events integration code written successfully.");
