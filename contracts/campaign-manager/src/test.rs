#![cfg(test)]

//! Integration tests for CampaignManager.
//!
//! `test_create_campaign_invokes_register_campaign` proves the full
//! cross-contract authorization flow:
//!
//!   user → CampaignManager::create_campaign()
//!         → env.authorize_as_current_contract(...)   ← the fix
//!         → DonationManager::register_campaign()
//!         → cm.require_auth()                        ← succeeds
//!
//! Without `authorize_as_current_contract`, `cm.require_auth()` inside a
//! sub-invocation raises `Error(Auth, InvalidAction)`.

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    Address, Env,
};

// Pull in the DonationManager contract so we can register it alongside CM.
use donation_manager::{DonationManager, DonationManagerClient};

// ─────────────────────────────────────────────────────────────────────────────
// Shared setup
// ─────────────────────────────────────────────────────────────────────────────

struct TestFixture {
    env: Env,
    cm: CampaignManagerClient<'static>,
    dm: DonationManagerClient<'static>,
}

fn setup() -> TestFixture {
    let env = Env::default();
    // mock_all_auths() satisfies every require_auth() call (owner, cm, donor…).
    // The authorize_as_current_contract path is still exercised: if the call
    // were absent the host would not find an authorization entry for cm inside
    // the sub-invocation and would panic.
    env.mock_all_auths();

    // Set ledger timestamp so future deadlines are easy to construct.
    env.ledger().with_mut(|l| l.timestamp = 1_000_000);

    // Use a generated address as a mock token (we don't need real token
    // transfers for register_campaign, only for donate/withdraw).
    let token_addr = Address::generate(&env);

    // Deploy CampaignManager and DonationManager
    let cm_id = env.register_contract(None, CampaignManager);
    let cm = CampaignManagerClient::new(&env, &cm_id);

    let dm_id = env.register_contract(None, DonationManager);
    let dm = DonationManagerClient::new(&env, &dm_id);

    // Cross-link: CM knows DM address; DM knows CM address + token
    cm.init(&dm_id);
    dm.init(&cm_id, &token_addr);

    TestFixture { env, cm, dm }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1 — THE KEY TEST
// Proves that authorize_as_current_contract enables cm.require_auth()
// inside register_campaign without Error(Auth, InvalidAction).
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_create_campaign_invokes_register_campaign() {
    let f = setup();
    let owner = Address::generate(&f.env);

    let campaign_id = f.cm.create_campaign(
        &owner,
        &soroban_sdk::String::from_str(&f.env, "Save the Rainforest"),
        &soroban_sdk::String::from_str(&f.env, "Plant 1M trees"),
        &500_000_000i128,   // goal: 50 XLM in stroops
        &2_000_000u64,      // deadline > 1_000_000 (current ledger time)
        &soroban_sdk::String::from_str(&f.env, "Environment"),
        &soroban_sdk::String::from_str(&f.env, "https://example.com/tree.png"),
    );

    // create_campaign() returns the sequential campaign ID starting at 1
    assert_eq!(campaign_id, 1u64, "First campaign must have ID 1");

    // Verify DonationManager registered the campaign (funds start at 0)
    let funds = f.dm.get_campaign_funds(&campaign_id);
    assert_eq!(funds, 0i128, "Newly registered campaign must have 0 raised");

    // Verify CampaignManager stored the metadata
    let meta = f.cm.get_campaign(&campaign_id)
        .expect("Campaign metadata must exist in CampaignManager");
    assert_eq!(meta.id,       1u64);
    assert_eq!(meta.goal,     500_000_000i128);
    assert_eq!(meta.deadline, 2_000_000u64);
    assert!(meta.active,      "Campaign must be active after creation");
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 2 — Multiple campaigns get sequential IDs and each is registered
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_multiple_campaigns_registered() {
    let f = setup();
    let owner = Address::generate(&f.env);

    for i in 1u64..=3 {
        let id = f.cm.create_campaign(
            &owner,
            &soroban_sdk::String::from_str(&f.env, "Campaign"),
            &soroban_sdk::String::from_str(&f.env, "desc"),
            &100_000_000i128,
            &2_000_000u64,
            &soroban_sdk::String::from_str(&f.env, "Tech"),
            &soroban_sdk::String::from_str(&f.env, ""),
        );
        assert_eq!(id, i, "Campaign IDs must be sequential");
        assert_eq!(f.dm.get_campaign_funds(&id), 0i128);
    }

    let all = f.cm.get_all_campaigns();
    assert_eq!(all.len(), 3u32, "get_all_campaigns must return all 3 campaigns");
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 3 — Deadline in the past is rejected before cross-contract call
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_create_campaign_rejects_past_deadline() {
    let f = setup();
    let owner = Address::generate(&f.env);

    // deadline (500_000) < ledger timestamp (1_000_000) → InvalidInput
    let result = f.cm.try_create_campaign(
        &owner,
        &soroban_sdk::String::from_str(&f.env, "Late"),
        &soroban_sdk::String::from_str(&f.env, "too late"),
        &100_000_000i128,
        &500_000u64,
        &soroban_sdk::String::from_str(&f.env, "Art"),
        &soroban_sdk::String::from_str(&f.env, ""),
    );

    assert!(result.is_err(), "Past deadline must be rejected with InvalidInput");
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 4 — Goal of 0 is rejected before cross-contract call
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_create_campaign_rejects_zero_goal() {
    let f = setup();
    let owner = Address::generate(&f.env);

    let result = f.cm.try_create_campaign(
        &owner,
        &soroban_sdk::String::from_str(&f.env, "Free"),
        &soroban_sdk::String::from_str(&f.env, "free money"),
        &0i128,           // zero goal → InvalidInput
        &2_000_000u64,
        &soroban_sdk::String::from_str(&f.env, "Finance"),
        &soroban_sdk::String::from_str(&f.env, ""),
    );

    assert!(result.is_err(), "Zero goal must be rejected with InvalidInput");
}
