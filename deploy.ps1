$ErrorActionPreference = "Stop"

$NETWORK = "testnet"
$SOURCE_ACCOUNT = "alice"
$XLM_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

Write-Host "Checking for Soroban identity '$SOURCE_ACCOUNT'..." -ForegroundColor Green
try {
    $keys = soroban keys ls 2>$null
    if ($keys -notmatch $SOURCE_ACCOUNT) {
        Write-Host "Generating new identity '$SOURCE_ACCOUNT'..." -ForegroundColor Green
        soroban keys generate $SOURCE_ACCOUNT --network $NETWORK
        Write-Host "Funding identity '$SOURCE_ACCOUNT'..." -ForegroundColor Green
        soroban keys fund $SOURCE_ACCOUNT --network $NETWORK
    }
} catch {
    Write-Host "Generating new identity '$SOURCE_ACCOUNT'..." -ForegroundColor Green
    soroban keys generate $SOURCE_ACCOUNT --network $NETWORK
    Write-Host "Funding identity '$SOURCE_ACCOUNT'..." -ForegroundColor Green
    soroban keys fund $SOURCE_ACCOUNT --network $NETWORK
}

Write-Host "Building smart contracts..." -ForegroundColor Green
Set-Location contracts
soroban contract build
Set-Location ..

Write-Host "Deploying Campaign Manager..." -ForegroundColor Green
$CM_ID = soroban contract deploy --wasm contracts/target/wasm32v1-none/release/campaign_manager.wasm --source $SOURCE_ACCOUNT --network $NETWORK
Write-Host "Campaign Manager deployed at: $CM_ID"

Write-Host "Deploying Donation Manager..." -ForegroundColor Green
$DM_ID = soroban contract deploy --wasm contracts/target/wasm32v1-none/release/donation_manager.wasm --source $SOURCE_ACCOUNT --network $NETWORK
Write-Host "Donation Manager deployed at: $DM_ID"

Write-Host "Initializing Campaign Manager..." -ForegroundColor Green
soroban contract invoke --id $CM_ID --source $SOURCE_ACCOUNT --network $NETWORK -- init --donation_manager $DM_ID

Write-Host "Initializing Donation Manager..." -ForegroundColor Green
soroban contract invoke --id $DM_ID --source $SOURCE_ACCOUNT --network $NETWORK -- init --campaign_manager $CM_ID --token_address $XLM_TOKEN

Write-Host "Updating .env file..." -ForegroundColor Green
$EnvPath = ".env"
$EnvContent = Get-Content $EnvPath
$EnvContent = $EnvContent -replace '^VITE_CAMPAIGN_MANAGER_ID=.*', "VITE_CAMPAIGN_MANAGER_ID=""$CM_ID"""
$EnvContent = $EnvContent -replace '^VITE_DONATION_MANAGER_ID=.*', "VITE_DONATION_MANAGER_ID=""$DM_ID"""
Set-Content -Path $EnvPath -Value $EnvContent

Write-Host "Deployment and Initialization complete! Your .env has been updated." -ForegroundColor Green
