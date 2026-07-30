#!/bin/bash
set -e

NETWORK="testnet"
SOURCE_ACCOUNT="alice"
XLM_TOKEN="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

echo -e "\033[32mChecking for Soroban identity '$SOURCE_ACCOUNT'...\033[0m"
if ! soroban keys ls | grep -q "$SOURCE_ACCOUNT"; then
    echo -e "\033[32mGenerating new identity '$SOURCE_ACCOUNT'...\033[0m"
    soroban keys generate $SOURCE_ACCOUNT --network $NETWORK
    echo -e "\033[32mFunding identity '$SOURCE_ACCOUNT'...\033[0m"
    soroban keys fund $SOURCE_ACCOUNT --network $NETWORK
fi

echo -e "\033[32mBuilding smart contracts...\033[0m"
cd contracts && soroban contract build && cd ..

echo -e "\033[32mDeploying Campaign Manager...\033[0m"
CM_ID=$(soroban contract deploy --wasm contracts/target/wasm32v1-none/release/campaign_manager.wasm --source $SOURCE_ACCOUNT --network $NETWORK)
echo "Campaign Manager deployed at: $CM_ID"

echo -e "\033[32mDeploying Donation Manager...\033[0m"
DM_ID=$(soroban contract deploy --wasm contracts/target/wasm32v1-none/release/donation_manager.wasm --source $SOURCE_ACCOUNT --network $NETWORK)
echo "Donation Manager deployed at: $DM_ID"

echo -e "\033[32mInitializing Campaign Manager...\033[0m"
soroban contract invoke --id $CM_ID --source $SOURCE_ACCOUNT --network $NETWORK -- init --donation_manager $DM_ID

echo -e "\033[32mInitializing Donation Manager...\033[0m"
soroban contract invoke --id $DM_ID --source $SOURCE_ACCOUNT --network $NETWORK -- init --campaign_manager $CM_ID --token_address $XLM_TOKEN

echo -e "\033[32mUpdating .env file...\033[0m"
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS requires an empty string argument with -i
  sed -i '' "s/^VITE_CAMPAIGN_MANAGER_ID=.*/VITE_CAMPAIGN_MANAGER_ID=\"$CM_ID\"/" .env
  sed -i '' "s/^VITE_DONATION_MANAGER_ID=.*/VITE_DONATION_MANAGER_ID=\"$DM_ID\"/" .env
else
  # Linux
  sed -i "s/^VITE_CAMPAIGN_MANAGER_ID=.*/VITE_CAMPAIGN_MANAGER_ID=\"$CM_ID\"/" .env
  sed -i "s/^VITE_DONATION_MANAGER_ID=.*/VITE_DONATION_MANAGER_ID=\"$DM_ID\"/" .env
fi

echo -e "\033[32mDeployment and Initialization complete! Your .env has been updated.\033[0m"
