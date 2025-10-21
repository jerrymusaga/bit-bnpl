#!/bin/bash

# BitBNPL Deployment Script
# This script helps deploy BitBNPL contracts to Mezo testnet

set -e  # Exit on error

echo "========================================="
echo "   BitBNPL Contract Deployment Script    "
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy .env.example to .env and fill in your values:"
    echo "   cp .env.example .env"
    echo ""
    exit 1
fi

# Source environment variables
source .env

# Check required variables
echo "🔍 Checking configuration..."
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env"
    exit 1
fi

if [ -z "$RPC_URL" ]; then
    echo "❌ Error: RPC_URL not set in .env"
    exit 1
fi

if [ -z "$MUSD_ADDRESS" ] || [ "$MUSD_ADDRESS" == "0x0000000000000000000000000000000000000000" ]; then
    echo "❌ Error: MUSD_ADDRESS not set or is zero address in .env"
    exit 1
fi

if [ -z "$PLATFORM_FEE_WALLET" ] || [ "$PLATFORM_FEE_WALLET" == "0x0000000000000000000000000000000000000000" ]; then
    echo "❌ Error: PLATFORM_FEE_WALLET not set or is zero address in .env"
    exit 1
fi

echo "✅ Configuration looks good!"
echo ""
echo "Configuration:"
echo "  RPC URL: $RPC_URL"
echo "  MUSD Token: $MUSD_ADDRESS"
echo "  Platform Fee Wallet: $PLATFORM_FEE_WALLET"
echo ""

# Compile contracts
echo "🔨 Compiling contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✅ Compilation successful!"
echo ""

# Ask for confirmation
echo "⚠️  WARNING: This will deploy contracts to the network!"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Deploying contracts..."
echo ""

# Deploy contracts
forge script script/DeployBitBNPL.s.sol:DeployBitBNPL \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    -vvv

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  - Insufficient gas (check your wallet balance)"
    echo "  - RPC issues (try again or use different RPC)"
    echo "  - Contract compilation errors"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "📝 Next steps:"
echo "1. Save the contract addresses from the output above"
echo "2. Update frontend/.env.local with the addresses"
echo "3. Update frontend/app/admin/page.tsx with your admin address"
echo "4. Deposit initial liquidity (see deployment output)"
echo "5. Test merchant registration and verification"
echo ""
