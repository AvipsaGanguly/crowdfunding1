const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname);
const srcDir = path.join(rootDir, 'src');

// 1. .env
const envContent = `VITE_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
VITE_HORIZON_URL="https://horizon-testnet.stellar.org"
VITE_RPC_URL="https://soroban-testnet.stellar.org"
VITE_CAMPAIGN_MANAGER_ID="CCNJIERHATAKJFUEMDENMOOEYO5UYWKNXFYPSFXI7G7UHXY2UGQAQRKQ"
VITE_DONATION_MANAGER_ID="CD6ZQT2ZLT4RE7KZCWX4BHM5LM6DK5Q3DHDPHJJ2TJ5QGK2XCUJIFJOA"
VITE_TOKEN_ADDRESS="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
`;
fs.writeFileSync(path.join(rootDir, '.env'), envContent);

// 2. Services
const servicesDir = path.join(srcDir, 'services');
if (!fs.existsSync(servicesDir)) fs.mkdirSync(servicesDir, { recursive: true });

const contractJs = `import { rpc, TransactionBuilder, Networks, Account, xdr } from '@stellar/stellar-sdk';

const RPC_URL = import.meta.env.VITE_RPC_URL;
const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE;

export const server = new rpc.Server(RPC_URL);

/**
 * Helper to build a basic transaction.
 */
export const buildTransaction = async (sourceAddress, builderFn) => {
  const account = await server.getAccount(sourceAddress);
  const builder = new TransactionBuilder(account, {
    fee: '10000', // Basic fee, for Soroban usually we use simulate to get real fee
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  builderFn(builder);
  
  builder.setTimeout(300);
  return builder.build();
};

/**
 * Simulate the transaction to get the footprint and resources.
 */
export const simulateTransaction = async (tx) => {
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(\`Simulation Error: \${sim.error}\`);
  }
  return sim;
};

/**
 * Submit transaction to network.
 */
export const submitTransaction = async (signedTx) => {
  const response = await server.sendTransaction(signedTx);
  if (response.status === 'ERROR') {
    throw new Error(\`Submit Failed: \${JSON.stringify(response.errorResult)}\`);
  }
  return response.hash;
};

/**
 * Wait for transaction to complete.
 */
export const pollTransactionStatus = async (txHash) => {
  let status = 'PENDING';
  let getTxResponse = null;

  while (status === 'PENDING') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    getTxResponse = await server.getTransaction(txHash);
    status = getTxResponse.status;
  }

  if (status === 'FAILED') {
    throw new Error('Transaction failed on-chain.');
  }

  return getTxResponse;
};
`;
fs.writeFileSync(path.join(servicesDir, 'contract.js'), contractJs);

const campaignJs = `import { Contract, xdr, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { server, buildTransaction, simulateTransaction } from './contract';

const CAMPAIGN_MANAGER_ID = import.meta.env.VITE_CAMPAIGN_MANAGER_ID;
const DONATION_MANAGER_ID = import.meta.env.VITE_DONATION_MANAGER_ID;

const cmContract = new Contract(CAMPAIGN_MANAGER_ID);
const dmContract = new Contract(DONATION_MANAGER_ID);

export const buildCreateCampaignTx = async (address, { title, description, goal, deadline, category, imageUrl }) => {
  return buildTransaction(address, (builder) => {
    builder.addOperation(
      cmContract.call("create_campaign",
        nativeToScVal(address, { type: 'address' }),
        nativeToScVal(title, { type: 'string' }),
        nativeToScVal(description, { type: 'string' }),
        nativeToScVal(goal, { type: 'i128' }),
        nativeToScVal(deadline, { type: 'u64' }),
        nativeToScVal(category, { type: 'string' }),
        nativeToScVal(imageUrl, { type: 'string' })
      )
    );
  });
};

export const buildDonateTx = async (address, campaignId, amount) => {
  return buildTransaction(address, (builder) => {
    builder.addOperation(
      dmContract.call("donate",
        nativeToScVal(address, { type: 'address' }),
        nativeToScVal(campaignId, { type: 'u64' }),
        nativeToScVal(amount, { type: 'i128' })
      )
    );
  });
};

export const buildWithdrawTx = async (address, campaignId) => {
  return buildTransaction(address, (builder) => {
    builder.addOperation(
      dmContract.call("withdraw",
        nativeToScVal(campaignId, { type: 'u64' })
      )
    );
  });
};

/**
 * Fetch a single campaign using simulateTransaction (Read-only call)
 */
export const fetchCampaign = async (id, publicKey) => {
  // We need a source account to simulate. If user is disconnected, use a placeholder or generic.
  const source = publicKey || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'; 
  try {
    const tx = await buildTransaction(source, (builder) => {
      builder.addOperation(
        cmContract.call("get_campaign", nativeToScVal(id, { type: 'u64' }))
      );
    });

    const sim = await simulateTransaction(tx);
    if (sim.result && sim.result.retval) {
      return scValToNative(sim.result.retval);
    }
  } catch (e) {
    console.error("Failed to fetch campaign:", id, e);
  }
  return null;
};

/**
 * Since get_all_campaigns doesn't exist yet natively or scales poorly,
 * we try to fetch sequentially until it fails.
 */
export const fetchAllCampaigns = async (publicKey) => {
  const campaigns = [];
  let id = 1;
  while (true) {
    const camp = await fetchCampaign(id, publicKey);
    if (!camp) break; // CampaignNotFound or error stops the loop
    campaigns.push(camp);
    id++;
    if (id > 20) break; // Hard limit for safety
  }
  return campaigns;
};
`;
fs.writeFileSync(path.join(servicesDir, 'campaign.js'), campaignJs);


// 3. Hooks
const useTransactionJs = `import { useState } from 'react';
import { useWallet } from './useWallet';
import { useToast } from './useToast';
import { submitTransaction, pollTransactionStatus, simulateTransaction } from '../services/contract';
import { TransactionBuilder, rpc } from '@stellar/stellar-sdk';

export const useTransaction = () => {
  const { signTransaction, address } = useWallet();
  const { addToast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const execute = async (buildTxFn, successMsg = 'Transaction successful!') => {
    if (!address) {
      addToast('Please connect your wallet first.', 'error');
      return false;
    }

    setIsPending(true);
    addToast('Simulating transaction...', 'info');

    try {
      // 1. Build & Simulate
      const tx = await buildTxFn(address);
      const sim = await simulateTransaction(tx);
      
      // Assemble actual tx with simulated footprint/fees
      const preparedTx = rpc.assembleTransaction(tx, sim).build();

      // 2. Sign
      addToast('Please sign the transaction in your wallet...', 'info');
      const signedXdr = await signTransaction(preparedTx.toXDR());

      // 3. Submit
      addToast('Submitting to network...', 'info');
      const hash = await submitTransaction(signedXdr);

      // 4. Wait for completion
      addToast('Transaction pending, waiting for confirmation...', 'info');
      await pollTransactionStatus(hash);

      const explorerLink = \`https://stellar.expert/explorer/testnet/tx/\${hash}\`;
      
      // We will show a success toast that includes HTML or we just give the string
      addToast(successMsg, 'success');
      console.log('Transaction Success:', explorerLink);
      
      return true;

    } catch (error) {
      console.error(error);
      addToast(error.message || 'Transaction failed.', 'error');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { execute, isPending };
};
`;
fs.writeFileSync(path.join(srcDir, 'hooks', 'useTransaction.js'), useTransactionJs);


// 4. Update CreateCampaign.jsx
const createCampaignJsx = `import React, { useState } from 'react';
import { useTransaction } from '../hooks/useTransaction';
import { buildCreateCampaignTx } from '../services/campaign';

const CreateCampaign = () => {
  const { execute, isPending } = useTransaction();
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    category: 'Technology',
    imageUrl: ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const deadlineTimestamp = Math.floor(new Date(form.deadline).getTime() / 1000);
    
    await execute(
      (address) => buildCreateCampaignTx(address, {
        title: form.title,
        description: form.description,
        goal: BigInt(form.goal * 10000000), // XLM decimals
        deadline: deadlineTimestamp,
        category: form.category,
        imageUrl: form.imageUrl
      }),
      'Campaign created successfully!'
    );
  };

  return (
    <div className="animate-fade-in" style={{padding: '2rem 5%', maxWidth: '600px', margin: '0 auto'}}>
      <h2 className="section-title">Create Campaign</h2>
      <form className="glass" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}} onSubmit={handleSubmit}>
        
        <input type="text" name="title" placeholder="Campaign Title" required className="input-field" onChange={handleChange} />
        <textarea name="description" placeholder="Description" required rows="4" className="input-field" onChange={handleChange}></textarea>
        
        <div style={{display: 'flex', gap: '1rem'}}>
          <input type="number" name="goal" placeholder="Goal (XLM)" required min="1" className="input-field" style={{flex: 1}} onChange={handleChange} />
          <input type="date" name="deadline" required className="input-field" style={{flex: 1}} onChange={handleChange} />
        </div>
        
        <input type="url" name="imageUrl" placeholder="Image URL (optional)" className="input-field" onChange={handleChange} />
        
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Processing...' : 'Submit Campaign'}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'CreateCampaign.jsx'), createCampaignJsx);


// 5. Update Home.jsx to fetch real data
const homeJsx = `import React, { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import StatsCard from '../components/StatsCard';
import CampaignCard from '../components/CampaignCard';
import { fetchAllCampaigns } from '../services/campaign';
import { LoadingSkeleton } from '../components/LoadingSpinner';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

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
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Home.jsx'), homeJsx);


// 6. Update CSS for inputs
const cssUpdates = `
.input-field {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 0.8rem 1rem;
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
  width: 100%;
}
.input-field:focus {
  outline: none;
  border-color: var(--accent-cyan);
}
`;
fs.appendFileSync(path.join(srcDir, 'styles', 'components.css'), cssUpdates);

console.log("Integration setup complete.");
