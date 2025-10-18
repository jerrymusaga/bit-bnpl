# BitBNPL + Mezo Protocol Integration Guide

## Overview

This guide explains how to integrate BitBNPL with Mezo Protocol for real MUSD minting, Bitcoin collateral management, and payment processing.

---

## 🏗️ Architecture

### Current Setup (Mock Data)
- Frontend: Next.js + TypeScript
- Wallet: RainbowKit + Wagmi
- Smart Contracts: PaymentProcessor.sol (not deployed)
- Data: Mock functions in `/lib/mockData.ts`

### Real Integration Architecture
```
User Wallet (Bitcoin/EVM)
    ↓
Mezo Passport (@mezo-org/passport)
    ↓
Mezo Protocol Contracts
    ├── MUSD Token Contract (mint/burn)
    ├── Vault Contract (collateral management)
    └── Borrowing Contract (loan positions)
    ↓
BitBNPL Payment Processor
    ├── Process merchant payments
    ├── Track installment plans
    └── Handle refunds
```

---

## 📦 Available Packages & Tools

### 1. **@mezo-org/passport** (Already Installed ✅)
- **Purpose**: Wallet connection for Bitcoin + Mezo wallets
- **Version**: 0.11.0
- **Features**:
  - Bitcoin wallet support (masquerades as EVM wallet)
  - Built on top of RainbowKit
  - Message signing with `useSignMessage()`
  - Smart account on Mezo chain

**Installation:**
```bash
npm install @mezo-org/passport @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query
```

### 2. **@mezo-org/musd-contracts**
- **Purpose**: MUSD smart contract ABIs and utilities
- **Version**: 1.0.2
- **Install:**
```bash
npm install @mezo-org/musd-contracts
```

---

## 🔗 Mezo Contract Addresses

### Mainnet
- **MUSD Token**: `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186`
- **Chain ID**: `1611` (Mezo Mainnet)
- **RPC**: `https://rpc.mezo.org`

### Testnet (Matsnet)
- **MUSD Token**: `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`
- **Chain ID**: `31611` (Mezo Testnet)
- **RPC**: `https://rpc.test.mezo.org`
- **Explorer**: https://explorer.test.mezo.org

### Other Contracts
- **PoolFactory**: `0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248`
- **MUSD/BTC Pool**: `0x52e604c44417233b6CcEDDDc0d640A405Caacefb`

---

## 🛠️ Integration Steps

### Step 1: Install Mezo Packages

```bash
npm install @mezo-org/musd-contracts
```

### Step 2: Update Wallet Provider to Use Mezo Passport

Replace the current RainbowKit config in `/app/providers.tsx`:

```typescript
'use client'

import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { getConfig } from '@mezo-org/passport' // Import Mezo Passport
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// Use Mezo Passport config instead of custom config
const config = getConfig({
  appName: 'BitBNPL',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  // This automatically configures Mezo Matsnet + Bitcoin wallets
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Step 3: Create Mezo Contract Hooks

Create `/hooks/useMezoContracts.ts`:

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

// Import ABIs from @mezo-org/musd-contracts
import { abi as MUSDabi } from '@mezo-org/musd-contracts/artifacts/MUSD.json'

const MUSD_ADDRESS = process.env.NEXT_PUBLIC_MUSD_ADDRESS as `0x${string}`
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`

export function useMezoContracts(userAddress?: `0x${string}`) {
  // Get user's MUSD balance
  const { data: musdBalance } = useReadContract({
    address: MUSD_ADDRESS,
    abi: MUSDabi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })

  // Get user's collateral in vault
  const { data: collateral } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI, // You'll need to get this from Mezo
    functionName: 'getCollateral',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })

  // Mint MUSD (borrow against collateral)
  const { writeContract: mintMUSD, data: mintHash } = useWriteContract()

  const { isLoading: isMinting } = useWaitForTransactionReceipt({
    hash: mintHash,
  })

  const borrowMUSD = async (amount: bigint) => {
    return mintMUSD({
      address: VAULT_ADDRESS,
      abi: VaultABI,
      functionName: 'mint',
      args: [amount],
    })
  }

  // Repay MUSD
  const { writeContract: repayMUSD, data: repayHash } = useWriteContract()

  const repayLoan = async (amount: bigint) => {
    return repayMUSD({
      address: VAULT_ADDRESS,
      abi: VaultABI,
      functionName: 'repay',
      args: [amount],
    })
  }

  return {
    musdBalance: musdBalance ? formatUnits(musdBalance as bigint, 18) : '0',
    collateral,
    borrowMUSD,
    repayLoan,
    isMinting,
  }
}
```

### Step 4: Update Your Smart Contract

Your `PaymentProcessor.sol` needs to integrate with Mezo's MUSD token:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMUSD is IERC20 {
    // Add any MUSD-specific functions if needed
}

contract BitBNPLPaymentProcessor is Ownable, ReentrancyGuard {
    IMUSD public immutable musd;

    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public constant FEE_DENOMINATOR = 10000;

    struct Payment {
        address buyer;
        address merchant;
        uint256 amount;
        string orderId;
        uint256 timestamp;
        PaymentStatus status;
        InstallmentPlan plan;
    }

    struct InstallmentPlan {
        uint8 months; // 0 = full payment, 3, 6, 12
        uint256 monthlyPayment;
        uint256 totalInterest;
        uint256 paidAmount;
        uint256 nextPaymentDue;
    }

    enum PaymentStatus {
        Pending,
        Completed,
        Installment,
        Failed,
        Refunded
    }

    mapping(bytes32 => Payment) public payments;
    mapping(address => uint256) public merchantBalances;
    mapping(address => bytes32[]) public userPayments;

    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed buyer,
        address indexed merchant,
        uint256 amount
    );

    event InstallmentPaid(
        bytes32 indexed paymentId,
        uint256 amount,
        uint256 remaining
    );

    constructor(address _musd) Ownable(msg.sender) {
        musd = IMUSD(_musd);
    }

    // Process payment with installment plan
    function processPayment(
        address merchant,
        uint256 amount,
        string memory orderId,
        uint8 installmentMonths // 0, 3, 6, or 12
    ) external nonReentrant returns (bytes32) {
        require(merchant != address(0), "Invalid merchant");
        require(amount > 0, "Amount must be > 0");
        require(
            installmentMonths == 0 ||
            installmentMonths == 3 ||
            installmentMonths == 6 ||
            installmentMonths == 12,
            "Invalid installment plan"
        );

        // Transfer MUSD from buyer to contract
        require(
            musd.transferFrom(msg.sender, address(this), amount),
            "MUSD transfer failed"
        );

        // Calculate fees
        uint256 fee = (amount * platformFee) / FEE_DENOMINATOR;
        uint256 merchantAmount = amount - fee;

        // Update merchant balance
        merchantBalances[merchant] += merchantAmount;

        // Create payment record
        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, merchant, orderId, block.timestamp)
        );

        InstallmentPlan memory plan;
        if (installmentMonths > 0) {
            // Calculate installment details (simplified)
            uint256 interestRate = getInterestRate(installmentMonths);
            uint256 totalWithInterest = amount + (amount * interestRate) / 10000;

            plan = InstallmentPlan({
                months: installmentMonths,
                monthlyPayment: totalWithInterest / installmentMonths,
                totalInterest: (amount * interestRate) / 10000,
                paidAmount: 0,
                nextPaymentDue: block.timestamp + 30 days
            });
        }

        payments[paymentId] = Payment({
            buyer: msg.sender,
            merchant: merchant,
            amount: amount,
            orderId: orderId,
            timestamp: block.timestamp,
            status: installmentMonths > 0 ? PaymentStatus.Installment : PaymentStatus.Completed,
            plan: plan
        });

        userPayments[msg.sender].push(paymentId);

        emit PaymentProcessed(paymentId, msg.sender, merchant, amount);

        return paymentId;
    }

    // Pay installment
    function payInstallment(bytes32 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.buyer == msg.sender, "Not payment owner");
        require(payment.status == PaymentStatus.Installment, "Not an installment payment");

        uint256 paymentAmount = payment.plan.monthlyPayment;

        // Transfer MUSD from buyer
        require(
            musd.transferFrom(msg.sender, address(this), paymentAmount),
            "MUSD transfer failed"
        );

        payment.plan.paidAmount += paymentAmount;
        payment.plan.nextPaymentDue = block.timestamp + 30 days;

        // Check if fully paid
        if (payment.plan.paidAmount >=
            (payment.amount + payment.plan.totalInterest)) {
            payment.status = PaymentStatus.Completed;
        }

        emit InstallmentPaid(
            paymentId,
            paymentAmount,
            (payment.amount + payment.plan.totalInterest) - payment.plan.paidAmount
        );
    }

    // Helper to calculate interest rate based on months
    function getInterestRate(uint8 months) internal pure returns (uint256) {
        if (months == 3) return 25; // 0.25% in basis points
        if (months == 6) return 50; // 0.5%
        if (months == 12) return 100; // 1%
        return 0;
    }

    // Merchant withdrawal
    function merchantWithdraw() external nonReentrant {
        uint256 balance = merchantBalances[msg.sender];
        require(balance > 0, "No balance");

        merchantBalances[msg.sender] = 0;
        require(musd.transfer(msg.sender, balance), "Transfer failed");
    }
}
```

### Step 5: Deploy Smart Contract

```bash
# In /contracts directory
forge create --rpc-url https://rpc.test.mezo.org \
  --private-key <YOUR_PRIVATE_KEY> \
  --constructor-args <MUSD_TESTNET_ADDRESS> \
  src/BitBNPLPaymentProcessor.sol:BitBNPLPaymentProcessor
```

---

## 🔑 Environment Variables

Create `/frontend/.env.local`:

```bash
# Mezo Network
NEXT_PUBLIC_MEZO_CHAIN_ID=31611
NEXT_PUBLIC_MEZO_RPC_URL=https://rpc.test.mezo.org

# Contract Addresses (Testnet)
NEXT_PUBLIC_MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
NEXT_PUBLIC_VAULT_ADDRESS=<YOUR_VAULT_ADDRESS>
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=<YOUR_DEPLOYED_CONTRACT>

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<YOUR_PROJECT_ID>
```

---

## 📚 Next Steps

1. **Get ABIs**: Clone `github.com/mezo-org/musd` and extract ABIs from `/artifacts`
2. **Test on Matsnet**: Use testnet MUSD to test all flows
3. **Get Testnet BTC**: Bridge testnet BTC to Mezo to test collateral
4. **Deploy Contracts**: Deploy PaymentProcessor to Mezo testnet
5. **Integrate Frontend**: Replace mock data with real contract calls
6. **Test Flows**:
   - Deposit BTC → Mint MUSD → Make purchase → Repay installments
7. **Mainnet**: Deploy to Mezo mainnet when ready

---

## 📖 Resources

- **Mezo Docs**: https://mezo.org/docs/developers/
- **MUSD GitHub**: https://github.com/mezo-org/musd
- **Mezo Explorer**: https://explorer.test.mezo.org
- **Passport Docs**: https://www.npmjs.com/package/@mezo-org/passport
- **Discord**: Join Mezo Discord for developer support

---

## ⚠️ Important Notes

1. **Mock Data**: Everything currently uses mock data. Real integration requires:
   - Deploying PaymentProcessor contract
   - Connecting to Mezo MUSD contracts
   - Managing real Bitcoin collateral via Mezo vaults

2. **Security**:
   - Never commit private keys
   - Use environment variables for all addresses
   - Audit smart contracts before mainnet

3. **Mezo Protocol Fee**: Check if Mezo charges any protocol fees for MUSD minting

4. **Liquidation**: Implement liquidation warnings when health factor < 1.1

---

This guide provides the foundation for real Mezo integration. The architecture allows you to replace mock functions one-by-one with real contract interactions while keeping the UI functional.
