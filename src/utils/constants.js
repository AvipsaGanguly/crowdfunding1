/**
 * Centralized constant definitions for Level 3 Stellar Crowdfunding dApp.
 */

// Stroop conversion scale factor (1 XLM = 10,000,000 Stroops)
export const STROOPS_PER_XLM = 10_000_000;

// Campaign goal thresholds (in XLM)
export const MIN_CAMPAIGN_GOAL_XLM = 1;
export const MAX_CAMPAIGN_GOAL_XLM = 1_000_000;

// Campaign donation limits (in XLM)
export const MIN_DONATION_AMOUNT_XLM = 0.1;
export const MAX_DONATION_AMOUNT_XLM = 100_000;

// Campaign metadata length limits
export const MIN_TITLE_LENGTH = 3;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;

// Stellar Expert Explorer URL base
export const STELLAR_EXPERT_TESTNET_URL = 'https://stellar.expert/explorer/testnet/tx/';
