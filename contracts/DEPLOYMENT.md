# BitBNPL Smart Contract Deployment Guide

## Overview

BitBNPL consists of two main smart contracts:

1. **MerchantRegistry** - Manages merchant registration, verification, and transaction tracking
2. **InstallmentProcessor** - Handles BNPL payments where platform pays merchants instantly and users pay platform in installments

## Contract Architecture

### Payment Flow:
```
User checks out at merchant → Platform pays merchant instantly (minus 1% fee) → User pays platform in installments
```

### Key Concepts:
- **Platform Liquidity Pool**: MUSD pool that platform uses to pay merchants instantly
- **Platform Fee**: 1% fee charged to merchant per transaction
- **User Interest**: 0-1.5% charged to user based on installment plan
- **Merchant Settlement**: Instant, no waiting for installment payments

## Prerequisites

1. **Foundry** - Ethereum development toolkit
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Environment Variables** - Create `.env` file:
   ```bash
   # Deployment wallet private key
   PRIVATE_KEY=your_private_key_here

   # Mezo testnet RPC URL
   RPC_URL=https://mezo-testnet-rpc-url

   # MUSD token address on Mezo
   MUSD_ADDRESS=0x...

   # Platform fee wallet (receives 1% fees)
   PLATFORM_FEE_WALLET=0x...

   # Etherscan API key for verification (optional)
   ETHERSCAN_API_KEY=your_api_key
   ```

## Deployment Steps

### 1. Update Deployment Configuration

Edit `script/DeployBitBNPL.s.sol`:
```solidity
// Update these constants
address constant MUSD_ADDRESS = 0x...; // Real MUSD address
address constant PLATFORM_FEE_WALLET = 0x...; // Your platform fee wallet
```

### 2. Deploy Contracts

```bash
# Dry run (simulation)
forge script script/DeployBitBNPL.s.sol:DeployBitBNPL \
  --rpc-url $RPC_URL

# Actual deployment
forge script script/DeployBitBNPL.s.sol:DeployBitBNPL \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify

# Verify contracts separately (if auto-verify fails)
forge verify-contract \
  --chain-id <chain_id> \
  --compiler-version v0.8.23 \
  <contract_address> \
  src/MerchantRegistry.sol:MerchantRegistry
```

### 3. Save Contract Addresses

After deployment, save addresses to your `.env`:
```bash
# Frontend .env
NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS=0x...
```

### 4. Fund Liquidity Pool

The platform needs MUSD to pay merchants instantly:

```bash
# Using cast (Foundry CLI)
cast send $INSTALLMENT_PROCESSOR_ADDRESS \
  "depositLiquidity(uint256)" \
  "10000000000000000000000" \ # 10,000 MUSD (18 decimals)
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# Or via smart contract call
# 1. Approve MUSD spending
cast send $MUSD_ADDRESS \
  "approve(address,uint256)" \
  $INSTALLMENT_PROCESSOR_ADDRESS \
  "10000000000000000000000" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# 2. Deposit liquidity
cast send $INSTALLMENT_PROCESSOR_ADDRESS \
  "depositLiquidity(uint256)" \
  "10000000000000000000000" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

## Post-Deployment Setup

### Register Test Merchants

```bash
# Register a merchant
cast send $MERCHANT_REGISTRY_ADDRESS \
  "registerMerchant(address,string,string,string,string,string)" \
  "0xMerchantWallet" \
  "Tech Haven" \
  "https://techhaven.example.com" \
  "electronics" \
  "TH" \
  "#3B82F6" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Verify Merchant (Admin Only)

```bash
cast send $MERCHANT_REGISTRY_ADDRESS \
  "verifyMerchant(address)" \
  "0xMerchantWallet" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Check Liquidity Pool Balance

```bash
cast call $INSTALLMENT_PROCESSOR_ADDRESS \
  "liquidityPool()" \
  --rpc-url $RPC_URL
```

## Frontend Integration

### 1. Copy Contract ABIs

```bash
# Generate ABIs
forge build

# Copy ABIs to frontend
cp out/MerchantRegistry.sol/MerchantRegistry.json \
   ../frontend/lib/abi/MerchantRegistry.json

cp out/InstallmentProcessor.sol/InstallmentProcessor.json \
   ../frontend/lib/abi/InstallmentProcessor.json
```

### 2. Update Frontend Constants

Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS=0x...
NEXT_PUBLIC_MUSD_ADDRESS=0x...
```

### 3. Create React Hooks

The hooks will use wagmi to interact with contracts:
- `useMerchantRegistry.ts` - Merchant registration, verification
- `useInstallmentProcessor.ts` - Already exists, update with new flow

## Contract Functions

### MerchantRegistry

**Public Functions:**
- `registerMerchant(...)` - Register new merchant
- `updateMerchant(...)` - Update merchant info
- `getMerchant(address)` - Get merchant details
- `isActiveMerchant(address)` - Check if merchant can accept payments

**Admin Functions:**
- `verifyMerchant(address)` - Verify a merchant
- `deactivateMerchant(address)` - Suspend merchant
- `activateMerchant(address)` - Reactivate merchant

### InstallmentProcessor

**Public Functions:**
- `createPurchase(...)` - User creates purchase (platform pays merchant)
- `makePayment(uint256)` - User makes installment payment
- `getPurchase(...)` - Get purchase details
- `getUserActivePurchases(address)` - Get user's active purchases

**Admin Functions:**
- `depositLiquidity(uint256)` - Add MUSD to pool
- `withdrawLiquidity(uint256)` - Remove MUSD from pool
- `setMerchantRegistry(address)` - Update registry address
- `setPlatformFeeWallet(address)` - Update fee wallet

## Testing

### Run Tests

```bash
# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test testCreatePurchase

# Run with verbosity
forge test -vvv
```

### Test Scenarios

1. **Merchant Registration**
   - Register new merchant
   - Verify merchant
   - Deactivate merchant
   - Update merchant info

2. **Purchase Flow**
   - Create purchase with registered merchant
   - Verify merchant receives payment instantly
   - Verify platform fee deducted
   - Check user installment plan created

3. **User Payments**
   - Make on-time payment
   - Make late payment (with fees)
   - Complete all payments
   - Check purchase marked as completed

4. **Liquidity Management**
   - Deposit liquidity
   - Withdraw liquidity
   - Check insufficient liquidity scenario

## Monitoring

### Check Platform Stats

```bash
# Total merchants
cast call $MERCHANT_REGISTRY_ADDRESS \
  "getTotalMerchants()" \
  --rpc-url $RPC_URL

# Liquidity pool balance
cast call $INSTALLMENT_PROCESSOR_ADDRESS \
  "liquidityPool()" \
  --rpc-url $RPC_URL

# Get merchant stats
cast call $MERCHANT_REGISTRY_ADDRESS \
  "getMerchant(address)" \
  "0xMerchantWallet" \
  --rpc-url $RPC_URL
```

### Events to Monitor

1. **MerchantRegistry Events:**
   - `MerchantRegistered` - New merchant registered
   - `MerchantVerified` - Merchant verified
   - `TransactionRecorded` - Transaction completed

2. **InstallmentProcessor Events:**
   - `PurchaseCreated` - New purchase created
   - `PaymentMade` - User made payment
   - `PurchaseCompleted` - All payments complete
   - `LateFeeApplied` - Late fee charged

## Security Considerations

1. **Liquidity Management**
   - Monitor liquidity pool levels
   - Set up alerts for low liquidity
   - Have contingency MUSD reserves

2. **Merchant Verification**
   - Only verify legitimate merchants
   - Regular merchant audits
   - Monitor for fraudulent activity

3. **Access Control**
   - Secure private keys (use hardware wallet/multisig)
   - Rotate keys periodically
   - Use separate wallets for different functions

4. **Smart Contract Security**
   - Contracts use OpenZeppelin libraries
   - ReentrancyGuard on payment functions
   - Access control on admin functions

## Troubleshooting

### Common Issues

1. **"Insufficient platform liquidity"**
   - Deposit more MUSD to liquidity pool
   - Check liquidityPool balance

2. **"Merchant not registered or inactive"**
   - Verify merchant is registered
   - Check merchant isActive status
   - Verify merchant if needed

3. **"Insufficient borrowing capacity"**
   - User needs more BTC collateral in Mezo
   - Or reduce purchase amount

4. **Failed transactions**
   - Check gas fees
   - Verify approvals set correctly
   - Check contract addresses

## Next Steps

After deployment:

1. ✅ Deploy contracts
2. ✅ Fund liquidity pool
3. ✅ Register test merchants
4. ✅ Verify merchants
5. ✅ Update frontend with contract addresses
6. ✅ Test purchase flow end-to-end
7. ✅ Build merchant dashboard
8. ✅ Create integration documentation
9. ✅ Launch on mainnet

## Support

For issues or questions:
- GitHub Issues: https://github.com/bitbnpl/bitbnpl
- Documentation: https://docs.bitbnpl.com
- Discord: https://discord.gg/bitbnpl
