import { Contract, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { buildTransaction, simulateTransaction } from './contract';

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
 * Fetch all campaign metadata in a single read-only call using get_all_campaigns.
 */
export const fetchAllCampaigns = async (publicKey) => {
  const source = publicKey || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
  try {
    const tx = await buildTransaction(source, (builder) => {
      builder.addOperation(
        cmContract.call("get_all_campaigns")
      );
    });

    const sim = await simulateTransaction(tx);
    if (sim.result && sim.result.retval) {
      const campaigns = scValToNative(sim.result.retval);
      return Array.isArray(campaigns) ? campaigns : [];
    }
  } catch (e) {
    console.error("Failed to fetch all campaigns via get_all_campaigns:", e);
  }
  return [];
};
