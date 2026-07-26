const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, 'contracts');

// Remove old directory safely
const oldCrowdfundingDir = path.join(contractsDir, 'crowdfunding');
if (fs.existsSync(oldCrowdfundingDir)) {
  fs.rmSync(oldCrowdfundingDir, { recursive: true, force: true });
}

// Workspace Cargo.toml
const workspaceCargoToml = `[workspace]
members = [
    "campaign-manager",
    "donation-manager"
]
resolver = "2"
`;
fs.writeFileSync(path.join(contractsDir, 'Cargo.toml'), workspaceCargoToml);

// ==========================================
// 1. Campaign Manager
// ==========================================
const cmDir = path.join(contractsDir, 'campaign-manager');
const cmSrcDir = path.join(cmDir, 'src');
fs.mkdirSync(cmSrcDir, { recursive: true });

const cmCargoToml = `[package]
name = "campaign-manager"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "20.0.0"
`;

const cmTypesRs = `use soroban_sdk::{contracterror, contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CampaignMetadata {
    pub id: u64,
    pub owner: Address,
    pub title: String,
    pub description: String,
    pub goal: i128,
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
    DonationManager,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    CampaignNotFound = 1,
    NotAuthorized = 2,
    InvalidInput = 3,
    DonationManagerNotSet = 4,
}
`;

const cmLibRs = `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, symbol_short};

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

        // Save metadata
        env.storage().persistent().set(&DataKey::Campaign(count), &campaign);
        env.storage().instance().set(&DataKey::CampaignCount, &count);

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
}
`;

fs.writeFileSync(path.join(cmDir, 'Cargo.toml'), cmCargoToml);
fs.writeFileSync(path.join(cmSrcDir, 'types.rs'), cmTypesRs);
fs.writeFileSync(path.join(cmSrcDir, 'lib.rs'), cmLibRs);

// ==========================================
// 2. Donation Manager
// ==========================================
const dmDir = path.join(contractsDir, 'donation-manager');
const dmSrcDir = path.join(dmDir, 'src');
fs.mkdirSync(dmSrcDir, { recursive: true });

const dmCargoToml = `[package]
name = "donation-manager"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "20.0.0"
`;

// Define a client stub for the campaign manager to query it. 
// We use a simplified struct to represent the return value.
const dmTypesRs = `use soroban_sdk::{contracterror, contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CampaignMetadata {
    pub id: u64,
    pub owner: Address,
    pub title: String,
    pub description: String,
    pub goal: i128,
    pub deadline: u64,
    pub category: String,
    pub image_url: String,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    CampaignFunds(u64), // Tracks raised amount
    CampaignManager,
    TokenAddress,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotAuthorized = 1,
    CampaignNotRegistered = 2,
    DeadlinePassed = 3,
    GoalNotReached = 4,
    DeadlineNotPassed = 5,
    CampaignInactive = 6,
    InvalidAmount = 7,
    SetupIncomplete = 8,
}
`;

const dmEventsRs = `use soroban_sdk::{Address, Env, symbol_short};

pub fn donation_received(env: &Env, campaign_id: u64, donor: Address, amount: i128) {
    let topics = (symbol_short!("donated"), campaign_id, donor);
    env.events().publish(topics, amount);
}

pub fn funds_withdrawn(env: &Env, campaign_id: u64, owner: Address, amount: i128) {
    let topics = (symbol_short!("withdraw"), campaign_id, owner);
    env.events().publish(topics, amount);
}
`;

const dmLibRs = `#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env, Symbol};

mod types;
mod events;
use types::{CampaignMetadata, DataKey, Error};

#[contract]
pub struct DonationManager;

#[contractimpl]
impl DonationManager {
    pub fn init(env: Env, campaign_manager: Address, token_address: Address) {
        env.storage().instance().set(&DataKey::CampaignManager, &campaign_manager);
        env.storage().instance().set(&DataKey::TokenAddress, &token_address);
    }

    /// Register a campaign. Can only be called by the Campaign Manager.
    pub fn register_campaign(env: Env, campaign_id: u64, _owner: Address) -> Result<(), Error> {
        let cm: Address = env.storage().instance().get(&DataKey::CampaignManager).ok_or(Error::SetupIncomplete)?;
        cm.require_auth();

        // Initialize funds to 0
        env.storage().persistent().set(&DataKey::CampaignFunds(campaign_id), &0i128);
        Ok(())
    }

    pub fn donate(env: Env, donor: Address, campaign_id: u64, amount: i128) -> Result<(), Error> {
        donor.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let mut raised: i128 = env.storage().persistent().get(&DataKey::CampaignFunds(campaign_id)).ok_or(Error::CampaignNotRegistered)?;

        let cm: Address = env.storage().instance().get(&DataKey::CampaignManager).ok_or(Error::SetupIncomplete)?;
        
        // Fetch metadata from Campaign Manager
        let campaign: CampaignMetadata = env.invoke_contract(
            &cm,
            &Symbol::new(&env, "get_campaign"),
            soroban_sdk::vec![&env, campaign_id.into_val(&env)]
        );

        if !campaign.active {
            return Err(Error::CampaignInactive);
        }

        let current_time = env.ledger().timestamp();
        if current_time >= campaign.deadline {
            return Err(Error::DeadlinePassed);
        }

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&donor, &env.current_contract_address(), &amount);

        raised += amount;
        env.storage().persistent().set(&DataKey::CampaignFunds(campaign_id), &raised);

        events::donation_received(&env, campaign_id, donor, amount);

        Ok(())
    }

    pub fn withdraw(env: Env, campaign_id: u64) -> Result<(), Error> {
        let cm: Address = env.storage().instance().get(&DataKey::CampaignManager).ok_or(Error::SetupIncomplete)?;
        
        let campaign: CampaignMetadata = env.invoke_contract(
            &cm,
            &Symbol::new(&env, "get_campaign"),
            soroban_sdk::vec![&env, campaign_id.into_val(&env)]
        );

        campaign.owner.require_auth();

        let mut raised: i128 = env.storage().persistent().get(&DataKey::CampaignFunds(campaign_id)).ok_or(Error::CampaignNotRegistered)?;

        if raised < campaign.goal {
            return Err(Error::GoalNotReached);
        }

        let current_time = env.ledger().timestamp();
        if current_time < campaign.deadline {
            return Err(Error::DeadlineNotPassed);
        }

        let amount_to_transfer = raised;
        raised = 0; // Prevent re-entrancy
        env.storage().persistent().set(&DataKey::CampaignFunds(campaign_id), &raised);

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &campaign.owner, &amount_to_transfer);

        events::funds_withdrawn(&env, campaign_id, campaign.owner, amount_to_transfer);

        Ok(())
    }
}
`;

fs.writeFileSync(path.join(dmDir, 'Cargo.toml'), dmCargoToml);
fs.writeFileSync(path.join(dmSrcDir, 'types.rs'), dmTypesRs);
fs.writeFileSync(path.join(dmSrcDir, 'events.rs'), dmEventsRs);
fs.writeFileSync(path.join(dmSrcDir, 'lib.rs'), dmLibRs);

console.log("Dual contract architecture created successfully!");
