# Soroban Crowdfunding Platform 🚀

[![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/REPO/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A next-generation decentralized crowdfunding platform built natively on the **Stellar Soroban** smart contract network. Launch campaigns, accept donations globally in XLM, and manage your fundraising seamlessly with a stunning, glassmorphic React interface.

---

## 📖 Project Overview

Traditional crowdfunding platforms suffer from high fees, geographical restrictions, and centralized control. This project leverages the speed and low cost of the Stellar network to provide a fully decentralized, non-custodial crowdfunding solution. 

Campaign managers can set funding goals and deadlines, while donors can contribute with full transparency. Funds are securely locked in the smart contract until the campaign succeeds and the owner initiates a withdrawal.

---

## ✨ Features

- **Decentralized Campaigns**: Create, manage, and fund campaigns without intermediaries.
- **Cross-Contract Architecture**: Separation of concerns between `CampaignManager` (metadata) and `DonationManager` (funds).
- **Real-Time Blockchain Events**: Live donation feed and progress bar updates powered by Soroban RPC polling.
- **Multi-Wallet Support**: Native integration with Freighter, xBull, Albedo, Lobstr, and Rabet via `stellar-wallets-kit`.
- **Glassmorphic UI**: A premium, highly responsive dark-mode interface built with Vanilla CSS.
- **Automated Lifecycle**: Time-locked withdrawals, goal validations, and unauthorized access prevention built directly into the smart contracts.

---

## 🏗️ Architecture

The platform is split into two primary layers:

1. **Smart Contracts (Rust / Soroban)**
   - `campaign-manager`: Handles campaign registration, metadata storage, and active state tracking.
   - `donation-manager`: Handles XLM token transfers, balance tracking, withdrawal logic, and deadline enforcements.

2. **Frontend (React / Vite)**
   - Communicates with the Stellar Testnet via `@stellar/stellar-sdk`.
   - Utilizes `EventContext` for zero-refresh UI updates.
   - Wraps transactions in a robust `useTransaction` hook for simulation, signing, and submission.

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS
- **Blockchain**: Stellar Soroban (Rust), `@stellar/stellar-sdk`, `stellar-wallets-kit`
- **Testing**: Vitest, React Testing Library, `soroban_sdk::testutils`
- **CI/CD**: GitHub Actions

---

## 📸 Screenshots

*(Replace these with actual screenshots of your application)*

| Dashboard | Create Campaign |
|-----------|-----------------|
| ![Dashboard Placeholder](https://via.placeholder.com/600x300?text=Dashboard+View) | ![Create Placeholder](https://via.placeholder.com/600x300?text=Create+Campaign+View) |

---

## 🔗 Live Demo & Smart Contracts

- **Live Demo**: [https://your-deployment-url.vercel.app](https://your-deployment-url.vercel.app)
- **Network**: Stellar Testnet
- **Campaign Manager Contract**: `CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABA` *(Placeholder)*
- **Donation Manager Contract**: `CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` *(Placeholder)*
- **Example Transaction Hash**: `[View on Stellar.Expert](https://stellar.expert/explorer/testnet/)` *(Placeholder)*

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (stable)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/USER/REPO.git
cd crowdfunding1
\`\`\`

### 2. Frontend Setup
\`\`\`bash
# Install dependencies (ignoring problematic scripts)
npm install --ignore-scripts

# Setup environment variables
cp .env.example .env

# Start the development server
npm run dev
\`\`\`

### 3. Smart Contract Compilation
\`\`\`bash
cd contracts

# Build the WebAssembly binaries
cargo build --target wasm32-unknown-unknown --release
\`\`\`

---

## 🧪 Testing

The project maintains rigorous testing standards across both the frontend and blockchain layers.

**Run Smart Contract Integration Tests (Rust)**:
\`\`\`bash
cd contracts
cargo test
\`\`\`

**Run Frontend UI Tests (Vitest)**:
\`\`\`bash
npm run test
\`\`\`

---

## ⚙️ CI/CD Pipeline

The project utilizes **GitHub Actions** for continuous integration. On every `push` and `pull_request` to the `main` branch, the pipeline automatically:
1. Provisions Node.js and Rust environments.
2. Builds the React frontend.
3. Executes the full Vitest suite.
4. Executes the native Soroban `cargo test` suite.

---

## 🚢 Deployment

### Deploying Contracts
Use the Soroban CLI to deploy your compiled `.wasm` files to the testnet:
\`\`\`bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/campaign_manager.wasm \
  --source YOUR_IDENTITY \
  --network testnet
\`\`\`
*Update the returned Contract IDs in your frontend `.env` file.*

### Deploying Frontend
The frontend is optimized for deployment on Vercel, Netlify, or Cloudflare Pages.
\`\`\`bash
npm run build
# Deploy the /dist directory
\`\`\`

---

## 📁 Project Structure

\`\`\`text
crowdfunding1/
├── .github/workflows/       # CI/CD pipelines
├── contracts/               # Soroban Smart Contracts
│   ├── campaign-manager/    # Metadata tracking
│   └── donation-manager/    # Funds handling
├── src/                     # React Frontend
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks (Wallet, Events, TXs)
│   ├── pages/               # Route components
│   ├── services/            # Blockchain RPC interactions
│   └── styles/              # Vanilla CSS stylesheets
├── index.html
├── vite.config.js
└── package.json
\`\`\`

---

## 🤝 Acknowledgements

- The [Stellar Development Foundation](https://stellar.org/) for the incredible Soroban ecosystem.
- The developers of `@creit.tech/stellar-wallets-kit` for seamless multi-wallet integration.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
