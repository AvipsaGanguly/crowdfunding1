#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec, IntoVal};

mod types;
use types::{CampaignMetadata, DataKey, Error};

#[contract]
pub struct CampaignManager;

#[contractimpl]
impl CampaignManager {
    /// Initialize with the donation manager address (which handles the funds)
    pub fn init(env: Env, donation_manager: Address) {
        env.storage().instance().set(&DataKey::DonationManager, &donation_manager);
    }

    /// Create a new campaign and notify the donation manager
    pub fn create_campaign(
        env: Env,
        owner: Address,
        title: String,
        description: String,
        goal: i128,
        deadline: u64,
        category: String,
        image_url: String,
    ) -> Result<u64, Error> {
        owner.require_auth();

        if goal <= 0 {
            return Err(Error::InvalidInput);
        }
        
        let current_time = env.ledger().timestamp();
        if deadline <= current_time {
            return Err(Error::InvalidInput); // Deadline in past
        }

        let mut count: u64 = env.storage().instance().get(&DataKey::CampaignCount).unwrap_or(0);
        count += 1;

        let campaign = CampaignMetadata {
            id: count,
            owner: owner.clone(),
            title,
            description,
            goal,
            deadline,
            category,
            image_url,
            active: true,
        };

        // Save metadata and update campaign count
        env.storage().persistent().set(&DataKey::Campaign(count), &campaign);
        env.storage().instance().set(&DataKey::CampaignCount, &count);

        // Maintain persistent vector of campaign IDs
        let mut campaign_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::CampaignIds)
            .unwrap_or_else(|| Vec::new(&env));
        campaign_ids.push_back(count);
        env.storage().persistent().set(&DataKey::CampaignIds, &campaign_ids);

        // Notify Donation Manager
        let donation_manager: Address = env
            .storage()
            .instance()
            .get(&DataKey::DonationManager)
            .ok_or(Error::DonationManagerNotSet)?;

        // Invoke cross-contract call
        env.invoke_contract::<()>(
            &donation_manager,
            &soroban_sdk::Symbol::new(&env, "register_campaign"),
            soroban_sdk::vec![&env, count.into_val(&env), owner.into_val(&env)]
        );

        Ok(count)
    }

    pub fn close_campaign(env: Env, campaign_id: u64) -> Result<(), Error> {
        let mut campaign: CampaignMetadata = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .ok_or(Error::CampaignNotFound)?;

        campaign.owner.require_auth();
        campaign.active = false;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
        Ok(())
    }

    pub fn get_campaign(env: Env, campaign_id: u64) -> Result<CampaignMetadata, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .ok_or(Error::CampaignNotFound)
    }

    /// Return all campaign metadata in a single read-only function
    pub fn get_all_campaigns(env: Env) -> Vec<CampaignMetadata> {
        let campaign_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::CampaignIds)
            .unwrap_or_else(|| Vec::new(&env));

        let mut all_campaigns = Vec::new(&env);
        for id in campaign_ids.iter() {
            if let Some(campaign) = env
                .storage()
                .persistent()
                .get::<DataKey, CampaignMetadata>(&DataKey::Campaign(id))
            {
                all_campaigns.push_back(campaign);
            }
        }
        all_campaigns
    }
}
