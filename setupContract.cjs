const fs = require('fs');
const path = require('path');

const contractDir = path.join(__dirname, 'contracts', 'crowdfunding');
if (!fs.existsSync(contractDir)) {
  fs.mkdirSync(contractDir, { recursive: true });
}

const srcDir = path.join(contractDir, 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

const cargoToml = `[package]
name = "crowdfunding"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "20.0.0"

[features]
testutils = ["soroban-sdk/testutils"]
`;

const typesRs = `use soroban_sdk::{contracterror, contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub id: u64,
    pub owner: Address,
    pub title: String,
    pub description: String,
    pub goal: i128,
    pub raised: i128,
    pub deadline: u64,
    pub category: String,
    pub image_url: String,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Campaign(u64),
    CampaignCount,
    TokenAddress,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    CampaignNotFound = 1,
    DeadlinePassed = 2,
    DeadlineNotPassed = 3,
    NotAuthorized = 4,
    InvalidAmount = 5,
    GoalNotReached = 6,
    CampaignInactive = 7,
    TokenNotInitialized = 8,
}
`;

const eventsRs = `use soroban_sdk::{Address, Env, Symbol, symbol_short};

pub fn campaign_created(env: &Env, campaign_id: u64, owner: Address) {
    let topics = (symbol_short!("created"), campaign_id);
    env.events().publish(topics, owner);
}

pub fn donation_received(env: &Env, campaign_id: u64, donor: Address, amount: i128) {
    let topics = (symbol_short!("donated"), campaign_id, donor);
    env.events().publish(topics, amount);
}

pub fn funds_withdrawn(env: &Env, campaign_id: u64, owner: Address, amount: i128) {
    let topics = (symbol_short!("withdraw"), campaign_id, owner);
    env.events().publish(topics, amount);
}

pub fn campaign_closed(env: &Env, campaign_id: u64) {
    let topics = (symbol_short!("closed"), campaign_id);
    env.events().publish(topics, ());
}
`;

const libRs = `#![no_std]
use soroban_sdk::{
    contract, contractimpl, token, Address, Env, String, Vec,
};

mod types;
mod events;

use types::{Campaign, DataKey, Error};

#[contract]
pub struct CrowdfundContract;

#[contractimpl]
impl CrowdfundContract {
    /// Initialize the contract with the accepted token address (e.g., XLM)
    pub fn init(env: Env, token_address: Address) {
        env.storage().instance().set(&DataKey::TokenAddress, &token_address);
    }

    /// Creates a new campaign.
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
            return Err(Error::InvalidAmount);
        }
        
        let current_time = env.ledger().timestamp();
        if deadline <= current_time {
            return Err(Error::DeadlinePassed);
        }

        let mut count: u64 = env.storage().instance().get(&DataKey::CampaignCount).unwrap_or(0);
        count += 1;

        let campaign = Campaign {
            id: count,
            owner: owner.clone(),
            title,
            description,
            goal,
            raised: 0,
            deadline,
            category,
            image_url,
            active: true,
        };

        env.storage().persistent().set(&DataKey::Campaign(count), &campaign);
        env.storage().instance().set(&DataKey::CampaignCount, &count);

        events::campaign_created(&env, count, owner);

        Ok(count)
    }

    /// Donates tokens to a specific campaign.
    pub fn donate(env: Env, donor: Address, campaign_id: u64, amount: i128) -> Result<(), Error> {
        donor.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .ok_or(Error::CampaignNotFound)?;

        if !campaign.active {
            return Err(Error::CampaignInactive);
        }

        let current_time = env.ledger().timestamp();
        if current_time >= campaign.deadline {
            return Err(Error::DeadlinePassed);
        }

        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .ok_or(Error::TokenNotInitialized)?;

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&donor, &env.current_contract_address(), &amount);

        campaign.raised += amount;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        events::donation_received(&env, campaign_id, donor, amount);

        Ok(())
    }

    /// Withdraw funds if the campaign goal is met and deadline passed.
    pub fn withdraw(env: Env, campaign_id: u64) -> Result<(), Error> {
        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .ok_or(Error::CampaignNotFound)?;

        campaign.owner.require_auth();

        if campaign.raised < campaign.goal {
            return Err(Error::GoalNotReached);
        }

        let current_time = env.ledger().timestamp();
        if current_time < campaign.deadline {
            return Err(Error::DeadlineNotPassed);
        }

        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .ok_or(Error::TokenNotInitialized)?;

        let token_client = token::Client::new(&env, &token_address);
        
        let amount_to_transfer = campaign.raised;
        campaign.raised = 0; // Prevent re-entrancy / double withdraw
        campaign.active = false;
        
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
        
        token_client.transfer(&env.current_contract_address(), &campaign.owner, &amount_to_transfer);

        events::funds_withdrawn(&env, campaign_id, campaign.owner, amount_to_transfer);

        Ok(())
    }

    /// Manually closes a campaign (e.g., if cancelled or finished).
    pub fn close_campaign(env: Env, campaign_id: u64) -> Result<(), Error> {
        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .ok_or(Error::CampaignNotFound)?;

        campaign.owner.require_auth();
        campaign.active = false;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        events::campaign_closed(&env, campaign_id);
        
        Ok(())
    }

    /// Get details of a single campaign.
    pub fn get_campaign(env: Env, campaign_id: u64) -> Result<Campaign, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .ok_or(Error::CampaignNotFound)
    }

    /// Get all campaigns (Warning: not suitable for massive datasets, good for prototyping).
    pub fn get_all_campaigns(env: Env) -> Vec<Campaign> {
        let mut campaigns = Vec::new(&env);
        let count: u64 = env.storage().instance().get(&DataKey::CampaignCount).unwrap_or(0);
        
        for i in 1..=count {
            if let Some(campaign) = env.storage().persistent().get(&DataKey::Campaign(i)) {
                campaigns.push_back(campaign);
            }
        }
        campaigns
    }
}
`;

fs.writeFileSync(path.join(contractDir, 'Cargo.toml'), cargoToml);
fs.writeFileSync(path.join(srcDir, 'types.rs'), typesRs);
fs.writeFileSync(path.join(srcDir, 'events.rs'), eventsRs);
fs.writeFileSync(path.join(srcDir, 'lib.rs'), libRs);

console.log("Contract structure created successfully!");
