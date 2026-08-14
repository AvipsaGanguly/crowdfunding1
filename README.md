# Stellar Soroban Crowdfunding Platform 🚀

[![CI](https://github.com/AvipsaGanguly/crowdfunding1/actions/workflows/ci.yml/badge.svg)](https://github.com/AvipsaGanguly/crowdfunding1/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Stellar Testnet](https://img.shields.io/badge/Network-Stellar%20Testnet-blue.svg)](https://stellar.org)

A next-generation, production-ready decentralized crowdfunding platform built natively on **Stellar Soroban** smart contracts. Launch campaigns, collect donations globally in native Testnet XLM, and manage your fundraising transparently with a glassmorphic React dApp.

---

## 🎥 Demo Video

Watch the full demo walkthrough of the application here:
[Watch Demo Video](https://drive.google.com/file/d/1IKXIlBIyGUvLcy8yq3jmJM8di9v28BDt/view?usp=sharing)

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **Rust** v1.75+ and **wasm32-unknown-unknown** target (for smart contracts)
- A browser with a Stellar wallet extension installed (e.g., [Freighter](https://www.freighter.app/))

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/AvipsaGanguly/crowdfunding1.git
cd crowdfunding1
npm install
```

### 2. Configure Environment Variables
Create a local `.env` file in the project root:
```env
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
VITE_CAMPAIGN_MANAGER_ID=CAPFOLYX5LZRFZZUPV374HOEXGLIA7QN3SR5SHA5V75W6PBZBK4KM52V
VITE_DONATION_MANAGER_ID=CAYUM76UIQMEQLE4JBMV2BJWWALTX3T5SGTKV75XBGCE2GQHN3A6YJKR
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Execute Test Suites & Build
```bash
# Run Vitest frontend test suite
npm test

# Run Rust smart contract test suite
cargo test --workspace --manifest-path contracts/Cargo.toml

# Compile Vite production bundle
npm run build
```

---

## 🛠️ Technology Stack & Dependencies

### Frontend & UI Layer
- **React 19 & Vite 8**: High-performance module bundling and reactive UI component tree
- **React Router 7**: Declarative client-side route navigation (`/`, `/create-campaign`, `/campaign/:id`, `/dashboard`, `/about`)
- **Vanilla CSS3**: HSL-customized variables, glassmorphism design system, micro-animations, and dynamic mobile responsiveness
- **Testing**: **Vitest** + `@testing-library/react` (17 test suites, 47 unit tests)

### Stellar Blockchain & Smart Contract Layer
- **Stellar Soroban WASM Engine**: `soroban-sdk` v22 (Rust smart contract framework)
- **`@stellar/stellar-sdk`**: RPC client interaction, transaction envelope parsing, and XDR serialization
- **`@creit.tech/stellar-wallets-kit`**: Multi-wallet support (Freighter, xBull, Albedo, Lobstr, Rabet)

---

## 📂 Project Directory Structure

```text
crowdfunding1/
├── contracts/                        # Soroban Rust Smart Contracts Workspace
│   ├── campaign-manager/             # Campaign metadata & registry contract
│   │   ├── src/ (lib.rs, types.rs, test.rs)
│   │   └── Cargo.toml
│   ├── donation-manager/             # XLM vault custody & donation tracking contract
│   │   ├── src/ (lib.rs, types.rs, test.rs)
│   │   └── Cargo.toml
│   └── Cargo.toml
├── src/                              # React 19 Frontend Application
│   ├── components/                   # UI components (Navbar, CampaignCard, Footer, etc.)
│   ├── context/                      # Context providers (WalletContext, EventContext, ToastContext)
│   ├── hooks/                        # Custom hooks (useWallet, useTransaction, useEvents, etc.)
│   ├── pages/                        # Page views (Home, CreateCampaign, CampaignDetails, Dashboard)
│   ├── services/                     # Stellar SDK & RPC contract interaction services
│   ├── styles/                       # Modular CSS design system tokens
│   ├── utils/                        # Format utilities & constant definitions
│   └── __tests__/                    # Vitest frontend test suites
├── screenshots/                      # Application walkthrough screenshots
├── .env.example                      # Environment variables template
├── README.md                         # Comprehensive project documentation & guide
└── vite.config.js                    # Vite bundler & test configuration
```

---

## 🧪 Testing Suite & Quality Gate

The codebase includes automated unit test suites for both frontend React modules and Soroban smart contract crates:

### 1. Frontend Test Suite (Vitest)
```bash
npm test
```
- **18 Test Suites / 48 Tests**: Component rendering, custom hooks (`useDocumentTitle`), RPC helper utilities, wallet state management, address truncation, and modal interactions.

### 2. Smart Contract Test Suite (Cargo / Rust)
```bash
cargo test --workspace --manifest-path contracts/Cargo.toml
```
- **13 Rust Contract Tests**: Verifies cross-contract registration idempotency, campaign goal validation, storage instance TTL extensions, campaign deactivation, and balance accounting.

---

## 🔒 Security Architecture & Storage Management

### 1. Non-Custodial Wallet Authorization
- Every state-modifying transaction (`create_campaign`, `donate`, `withdraw`) requires cryptographic user authorization (`require_auth()`). Donors and creators maintain full non-custodial control over their funds.

### 2. Soroban Cross-Contract Sub-Invocation Authorization
- Cross-contract balance accounting calls from `CampaignManager` to `DonationManager` use `env.authorize_as_current_contract(...)` to satisfy Soroban host runtime sub-invocation authorization checks without throwing `Error(Auth, InvalidAction)`.

### 3. Instance Storage Lifetime (TTL) Extension
- Persistent contract state entries extend their storage lifetime via `env.storage().instance().extend_ttl(...)` during invocation to prevent storage eviction on Stellar Testnet ledgers.

### 4. Input Boundary Validation & Error Boundaries
- Strict frontend boundary validation (title length limits, positive donation amounts, future deadlines) coupled with root-level React `ErrorBoundary` catchers to prevent runtime state crashes.

---

## 📖 Project Overview

Traditional crowdfunding platforms suffer from high platform fees, cross-border payment friction, delayed payouts, and centralized control. This project leverages the speed, minimal fees, and native cross-contract capabilities of the **Stellar Soroban** smart contract engine to provide a fully decentralized, non-custodial crowdfunding dApp.

Campaign creators specify a fundraising goal in XLM, a campaign category, and a deadline. Donors can contribute directly using any supported Stellar wallet. Funds are securely locked in the smart contract ecosystem and can be withdrawn by the creator once the deadline passes and conditions are met.

---

## ✨ Features

- **Decentralized Campaign Lifecycle**: Launch, view, and fund campaigns directly on the Stellar Testnet.
- **Cross-Contract Architecture**: Clean separation of concerns between `CampaignManager` (metadata & registry) and `DonationManager` (XLM fund custody & balance accounting).
- **Native Soroban Authorization**: Pre-authorized cross-contract sub-invocations using `env.authorize_as_current_contract(...)` to prevent `Error(Auth, InvalidAction)`.
- **Flexible Descriptions & Responsive Cards**: Optional campaign descriptions with intelligent fallbacks (`"No description provided."`) and responsive cards that automatically adjust height when no image is provided.
- **Multi-Wallet Integration**: Built-in support for Freighter, xBull, Albedo, Lobstr, and Rabet via `@creit.tech/stellar-wallets-kit` with explicit user-initiated wallet connection, switching, and disconnection.
- **Real-Time Blockchain Updates**: On-chain RPC status polling and event stream listeners for dynamic progress bar updates without manual page refreshes.
- **Detailed Transaction Receipts**: Post-donation summary modals displaying transaction hash, status, ledger number, timestamp, and direct links to Stellar Expert explorer.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User([User / Browser]) <--> ReactApp[React 19 Frontend / Vite]
    ReactApp <--> WalletKit[Stellar Wallets Kit / Freighter / xBull]
    ReactApp <--> RPC[Soroban RPC Testnet Node]
    
    subgraph Soroban Blockchain Core
        RPC <--> CM[CampaignManager Contract]
        CM -- "Sub-Invocation (pre-authorized)" --> DM[DonationManager Contract]
        DM <--> Token[Native Testnet XLM Token Contract]
    end
```

---

## 📜 Smart Contract Explanation

The smart contract suite consists of two Rust contracts compiled for Soroban WASM targets:

### 1. `CampaignManager` (`contracts/campaign-manager/`)
- **Role**: Primary entry point for campaign creation and metadata retrieval.
- **Key Functions**:
  - `init(env, donation_manager)`: Initializes the contract with the `DonationManager` address.
  - `create_campaign(env, owner, title, description, goal, deadline, category)`: Validates campaign input parameters, assigns a sequential `u64` campaign ID, stores `CampaignMetadata`, pre-authorizes the sub-invocation (`env.authorize_as_current_contract(...)`), and calls `DonationManager::register_campaign`.
  - `get_campaign(env, campaign_id)`: Fetches metadata for a single campaign.
  - `get_all_campaigns(env)`: Iterates through stored campaign IDs and returns all active campaign metadata structs.
  - `close_campaign(env, campaign_id)`: Allows the campaign owner to deactivate a campaign.

### 2. `DonationManager` (`contracts/donation-manager/`)
- **Role**: Manages fund custody, token balance accounting, deposits, and withdrawals.
- **Key Functions**:
  - `init(env, campaign_manager, token_address)`: Configures the associated `CampaignManager` and native XLM token address.
  - `register_campaign(env, campaign_id)`: Restricted function (requires `CampaignManager` auth) that initializes campaign funds to `0`.
  - `donate(env, donor, campaign_id, amount)`: Transfers XLM stroops from the donor to the `DonationManager` contract address and updates `CampaignFunds`.
  - `get_campaign_funds(env, campaign_id)`: Public read-only method returning total raised stroops for a campaign.
  - `withdraw(env, campaign_id)`: Releases accumulated XLM to the campaign creator after deadline verification.

---

## 📍 Deployed Contract Addresses (Stellar Testnet)

| Contract / Asset | Stellar Address / Hash | Explorer Link |
| :--- | :--- | :--- |
| **Campaign Manager** | `CAPFOLYX5LZRFZZUPV374HOEXGLIA7QN3SR5SHA5V75W6PBZBK4KM52V` | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAPFOLYX5LZRFZZUPV374HOEXGLIA7QN3SR5SHA5V75W6PBZBK4KM52V) |
| **Donation Manager** | `CAYUM76UIQMEQLE4JBMV2BJWWALTX3T5SGTKV75XBGCE2GQHN3A6YJKR` | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAYUM76UIQMEQLE4JBMV2BJWWALTX3T5SGTKV75XBGCE2GQHN3A6YJKR) |
| **Native Testnet XLM Token** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |

---

## 👛 Multi-Wallet Architecture & Integration

StellarFund integrates `@creit.tech/stellar-wallets-kit` providing unified multi-wallet support across 5 leading Stellar browser extensions and key managers:

- **Freighter**: Official Stellar Development Foundation wallet extension.
- **xBull**: Modular, high-security power user wallet.
- **Albedo**: Web-based key manager requiring no extension installation.
- **Lobstr**: Popular mobile & web wallet with QR authorization.
- **Rabet**: Lightweight extension wallet for dApp power users.

### Session Lifecycle Management:
1. **Connection**: User selects provider -> wallet returns active public key -> stored in `localStorage.setItem('connectedWalletAddress')`.
2. **Switching**: `switchWallet()` purges existing localStorage session and opens modal selector.
3. **Disconnection**: `disconnect()` cleans up React context state, revokes stored keys, and resets UI.

---

## 🔗 Transaction Hash Examples

- **Campaign Deployment & Init Tx**: [`45a651b8ccf7671cdc22d51a04f4ea2f99d2ecbb6ff3c0739cffcead1909f58e`](https://stellar.expert/explorer/testnet/tx/45a651b8ccf7671cdc22d51a04f4ea2f99d2ecbb6ff3c0739cffcead1909f58e)
- **Donation Manager Init Tx**: [`da39722660ee943d12e58fc7d3e9e48ba4e6b3653715817501784b5709f5932f`](https://stellar.expert/explorer/testnet/tx/da39722660ee943d12e58fc7d3e9e48ba4e6b3653715817501784b5709f5932f)

---

## ⚡ Soroban RPC Simulation & Transaction Execution Flow

Every write transaction (Campaign Creation, XLM Donation, Campaign Withdrawal) follows a strict 5-phase execution pipeline managed by `src/hooks/useTransaction.js` and `src/services/contract.js`:

1. **Transaction Assembly**: Builds Soroban transaction operation using `@stellar/stellar-sdk` with sequence numbers and network passphrase.
2. **Soroban RPC Simulation**: Invokes `server.simulateTransaction(tx)` to simulate smart contract execution on-chain, calculating precise CPU/memory footprint, storage entries, and fee requirements.
3. **Wallet Signing Prompt**: Assembles transaction XDR string and dispatches to connected user wallet (`stellar-wallets-kit.signTx(...)`).
4. **Broadcast & Ledger Submission**: Transmits signed XDR envelope via `server.sendTransaction(signedTx)` to Stellar RPC nodes.
5. **On-Chain Confirmation Polling**: Polls `server.getTransaction(txHash)` every 2s until ledger status transitions to `SUCCESS`.

---

## 🌐 Live Demo

- **Vercel Web App**: [https://crowdfunding1.vercel.app](https://crowdfunding1.vercel.app) *(or your deployed Vercel domain)*
- **Stellar Network**: Testnet (Chain ID: `Test SDF Network ; September 2015`)

---

## 📁 Repository Structure

```text
crowdfunding1/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline (Node.js & Rust)
├── contracts/
│   ├── Cargo.toml               # Workspace manifest
│   ├── campaign-manager/        # Campaign Manager smart contract crate
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs           # Entry point & contract logic
│   │       ├── types.rs         # Data structures & errors
│   │       └── test.rs          # Cross-contract integration tests
│   └── donation-manager/        # Donation Manager smart contract crate
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs           # Entry point & custody logic
│           ├── types.rs         # Data structures & errors
│           └── test.rs          # Unit tests
├── src/
│   ├── __tests__/               # Vitest unit & component test suite
│   │   ├── CreateCampaign.test.jsx
│   │   ├── Dashboard.test.jsx
│   │   ├── WalletButton.test.jsx
│   │   ├── stellarService.test.js
│   │   └── walletService.test.js
│   ├── components/              # Reusable React components
│   │   ├── CampaignCard.jsx
│   │   ├── DonationSuccessModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── WalletButton.jsx
│   │   └── WalletSelectorModal.jsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useCampaign.jsx
│   │   ├── useTransaction.js
│   │   └── useWallet.jsx
│   ├── pages/                   # Application pages
│   │   ├── CampaignDetails.jsx
│   │   ├── CreateCampaign.jsx
│   │   ├── Dashboard.jsx
│   │   └── Home.jsx
│   ├── services/                # Stellar & Soroban RPC integration layer
│   │   ├── campaign.js
│   │   ├── contract.js
│   │   ├── stellar.js
│   │   └── wallet.js
│   └── styles/                  # Glassmorphic CSS design system
│       ├── components.css
│       └── global.css
├── .env                         # Environment configuration
├── .gitignore                   # Target & build exclusions
├── deploy.ps1                   # Automated build & deployment script
├── package.json                 # Node dependencies & scripts
├── vercel.json                  # SPA routing configuration for Vercel
├── vite.config.js               # Vite build configuration
└── README.md
```

---

## 💻 Local Setup & Development Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Rust**: `1.77+` with target `wasm32v1-none` or `wasm32-unknown-unknown`
- **Soroban CLI**: `soroban-cli v20.0+`

### 2. Installation
```bash
git clone https://github.com/AvipsaGanguly/crowdfunding1.git
cd crowdfunding1

# Install frontend dependencies
npm install --ignore-scripts
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or update existing):
```env
VITE_STELLAR_NETWORK=testnet
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_CAMPAIGN_MANAGER_ID=CAPFOLYX5LZRFZZUPV374HOEXGLIA7QN3SR5SHA5V75W6PBZBK4KM52V
VITE_DONATION_MANAGER_ID=CAYUM76UIQMEQLE4JBMV2BJWWALTX3T5SGTKV75XBGCE2GQHN3A6YJKR
```

### 4. Running Locally
```bash
npm run dev
```

---

## 🧪 Testing

The platform maintains comprehensive automated test coverage across both smart contract and frontend layers.

### 1. Smart Contract Tests (Rust / Soroban)
Runs 10 unit and integration test cases across `campaign-manager` and `donation-manager` crates:
```bash
cd contracts
cargo test --workspace
```

### 2. Frontend Test Suite (Vitest + React Testing Library)
Runs 34 component and service test cases across 8 test suites (`formatUtils`, `explorerUtils`, `ProgressBar`, `WalletButton`, `CreateCampaign`, `Dashboard`, `stellarService`, `walletService`):
```bash
npm test
```

---

## 🚀 Building & Deployment

### Build Smart Contracts
```bash
cd contracts
soroban contract build
```

### Deploy & Initialize Contracts to Testnet
Run the automated deployment script:
```powershell
.\deploy.ps1
```

### Build Production Frontend
```bash
npm run build
```

---

## 🖼️ Screenshots


![](image.png)

![CI/CD pipeline running and Test output with 3+ passing tests](image-2.png)

![Mobile responsive UI](image-3.png)
---

## 🛠️ Troubleshooting & Environment Configuration

### Required Environment Variables (.env / Vercel Settings):
- `VITE_CAMPAIGN_MANAGER_ID`: Deployed Soroban `CampaignManager` contract ID.
- `VITE_DONATION_MANAGER_ID`: Deployed Soroban `DonationManager` contract ID.
- `VITE_RPC_URL`: Stellar Soroban RPC endpoint (`https://soroban-testnet.stellar.org`).
- `VITE_NETWORK_PASSPHRASE`: Network Passphrase (`Test SDF Network ; September 2015`).

### Common Issues & Resolution:
- **Blank screen on deployment**: Ensure `VITE_` variables are registered under Vercel Settings -> Environment Variables.
- **User rejection error (`HostError: Error(Auth, InvalidAction)`)**: Ensure Freighter/xBull extension is set to `Testnet` network.
- **Vitest Windows child process timeout**: Run tests with `npx vitest run --fileParallelism=false`.

---

## ✅ Production Readiness & Level 3 Checklist

- [x] **Advanced Soroban Smart Contracts**: WASM compiled `CampaignManager` and `DonationManager` with cross-contract sub-invocations.
- [x] **Event Streaming & Real-Time RPC Updates**: Polling event engine for ledger-level donation event decoding.
- [x] **Multi-Wallet Integration**: Support for Freighter, xBull, Albedo, Lobstr, and Rabet via `@creit.tech/stellar-wallets-kit`.
- [x] **CI/CD Pipeline**: GitHub Actions workflow testing Node 20 & Rust WASM targets on every push.
- [x] **Automated Test Suite**: 46 Vitest frontend tests (across 16 test suites) + 12 Soroban Rust contract tests (across 2 crates).
- [x] **Live Vercel Deployment**: Configured with SPA route rewrites and live SSL endpoints.

---

## 🔮 Future Improvements

- **Multi-Asset Support**: Expand beyond native XLM to support USDC and custom Stellar assets.
- **Milestone-Based Payouts**: Introduce multi-sig milestone approvals before releasing funds to creators.
- **DAO Governance**: Implement community voting on campaign validation and featured listings.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
