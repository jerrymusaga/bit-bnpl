# 📘 BitBNPL - Complete System Architecture & Implementation

---

## 🎯 What is BitBNPL?

**BitBNPL** (Bitcoin Buy Now Pay Later) is a decentralized payment platform that allows users to purchase goods using Bitcoin as collateral without selling their BTC. It combines:

1. **Bitcoin-backed stablecoin (MUSD)** from Mezo Protocol
2. **Installment payment system** (0.5-1.5% APR)
3. **Instant merchant settlement** from platform liquidity pool
4. **MoonPay onramp/offramp** for easy BTC acquisition (planned)

---

## 🏗️ System Architecture

### Three Main Components:

```
┌─────────────────────────────────────────────────────────────┐
│                     BITBNPL ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. MEZO PROTOCOL (Bitcoin Layer)                           │
│     ├─ BorrowerOperations.sol (Deposit BTC, Borrow MUSD)    │
│     ├─ TroveManager.sol (Manage Collateral Positions)       │
│     └─ PriceFeed.sol (BTC Price Oracle)                     │
│                                                              │
│  2. BITBNPL CONTRACTS (Payment Layer)                       │
│     ├─ MerchantRegistry.sol (Merchant Management)           │
│     └─ InstallmentProcessor.sol (BNPL Logic)                │
│                                                              │
│  3. FRONTEND (User Interface)                               │
│     ├─ Dashboard (BTC → MUSD Management)                    │
│     ├─ Marketplace (Discover Merchants)                     │
│     ├─ Checkout (Purchase & Installments)                   │
│     └─ MoonPay Integration (Buy BTC with Fiat)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 How BitBNPL Works (End-to-End)

### Phase 1: User Onboarding (With MoonPay)

#### Scenario A: User has NO Bitcoin

```
User → MoonPay Onramp → Buy BTC with Credit Card/Bank Transfer
                      → BTC sent to user's wallet
```

**MoonPay Integration Flow:**
```
1. User clicks "Buy BTC" in dashboard
2. Opens MoonPay widget (embedded iframe)
3. User selects: Amount ($500 USD) → Payment Method (Credit Card)
4. MoonPay processes payment (KYC if needed)
5. BTC deposited to user's connected wallet address
6. User receives ~0.005 BTC (depending on price)
```

#### Scenario B: User already has Bitcoin

```
User already has BTC in wallet → Skip to Phase 2
```

---

### Phase 2: Collateralization (Mezo Protocol)

```
User's BTC → Deposit to Mezo Vault → Create "Trove" (CDP)
          → Borrow MUSD (up to 90% LTV)
```

**Smart Contract Flow:**
```solidity
// 1. User deposits 0.01 BTC (worth $1,000)
BorrowerOperations.openTrove(
  maxFeePercentage: 0.5%,
  MUSDAmount: 900 MUSD,  // 90% LTV
  collateralAmount: 0.01 BTC
)

// 2. Mezo creates Trove
TroveManager.addCollateral(user, 0.01 BTC)
TroveManager.increaseDebt(user, 900 MUSD)

// 3. User receives 900 MUSD in wallet
// BTC stays locked in Mezo vault
```

**Key Concepts:**
- **Trove** = Collateralized Debt Position (like MakerDAO Vault)
- **LTV** = Loan-to-Value (max 90% to prevent liquidation)
- **Interest** = 1% APR on MUSD borrowed from Mezo
- **Liquidation** = If BTC price drops and LTV > 90%, position gets liquidated

---

### Phase 3: Shopping (Merchant Integration)

#### Merchant Setup:

```
Merchant registers → /merchant/register
               ↓
Admin verifies → /admin (Merchants tab)
               ↓
Merchant verified ✅ → Gets integration code
               ↓
Adds BitBNPL button to store
```

**Merchant's Product Page:**
```html
<!-- Simple Link Integration -->
<a href="https://bitbnpl.com/checkout?merchant=0xMerchantAddress&amount=299.99&itemName=Gaming%20Headset&itemId=prod_789&itemImage=🎧">
  Pay with BitBNPL 🟠
</a>
```

#### Customer Journey:

```
Customer browses merchant store
     ↓
Clicks "Pay with BitBNPL 🟠"
     ↓
Redirected to: bitbnpl.com/checkout?merchant=0x...&amount=299.99&item=...
     ↓
BitBNPL checkout page loads with product pre-filled
```

---

### Phase 4: Checkout & Payment

#### Checkout Page Flow:

```javascript
// 1. Verify merchant is verified
const merchantInfo = useMerchantDetails(merchantAddress)
if (!merchantInfo.isVerified || !merchantInfo.isActive) {
  → Show "Merchant Not Verified" error
  → Redirect to /marketplace
}

// 2. Check user's MUSD balance
const musdBalance = useMezoContracts().musdBalance  // 900 MUSD
const purchaseAmount = 299.99 MUSD
const hasSufficientBalance = musdBalance >= purchaseAmount  // true ✅

// 3. If insufficient MUSD
if (!hasSufficientBalance) {
  → Show "Get MUSD First" modal
  → Redirect to /dashboard
  → User borrows more MUSD or deposits more BTC
  → Returns to checkout
}

// 4. Select installment plan
User selects: 4 payments (0.5% interest)
Total owed: $301.50 × 4 = $1,206 (includes 0.5% interest)

// 5. Review & Confirm
Platform shows:
  - Merchant gets: $296.99 (99% after 1% platform fee)
  - User pays: $1,206 in 4 bi-weekly installments
  - First payment: Today
  - Remaining payments: Every 14 days
```

#### Smart Contract Execution:

```solidity
// User clicks "Complete Purchase"
InstallmentProcessor.createPurchase(
  merchantAddress: 0x123...,
  amount: 299.99 MUSD,
  totalPayments: 4,
  userBorrowingCapacity: 900 MUSD
)

// Contract logic:
1. Check: merchant.isVerified ✅
2. Check: merchant.isActive ✅
3. Check: liquidityPool >= 296.99 MUSD ✅
4. Calculate: merchantAmount = 299.99 * 0.99 = 296.99 MUSD
5. Calculate: platformFee = 299.99 * 0.01 = 3 MUSD
6. Calculate: interestRate = 0.5% for 4 payments
7. Calculate: amountWithInterest = 299.99 * 1.005 = 301.49 MUSD

// Execute transfers:
8. Transfer 296.99 MUSD from liquidityPool → merchant ✅ INSTANT
9. Record debt: user owes platform 301.49 MUSD
10. Create payment schedule: 4 payments of 75.37 MUSD every 14 days
11. Update merchant stats: totalSales++, totalVolume += 296.99
12. Emit event: PurchaseCreated(purchaseId, user, merchant, amount)
```

**Key Innovation:**
- ✅ **Merchant gets paid INSTANTLY** from platform liquidity pool
- ✅ **User pays back platform over time** (bi-weekly)
- ✅ **Platform earns interest** (0.5%) + platform fee (1%)
- ✅ **No merchant risk** - already received money

---

### Phase 5: Installment Payments

```
Day 1: Purchase created
Day 14: Payment 1 due ($75.37)
Day 28: Payment 2 due ($75.37)
Day 42: Payment 3 due ($75.37)
Day 56: Payment 4 due ($75.37)
```

**Making a Payment:**
```solidity
// User clicks "Pay Now" in /dashboard
InstallmentProcessor.makePayment(purchaseId)

// Contract logic:
1. Check: payment not already made ✅
2. Check: user has sufficient MUSD ✅
3. Transfer: 75.37 MUSD from user → liquidityPool
4. Update: paymentsRemaining--
5. If all payments complete: mark purchase as completed
6. If late (> 7 days past due): charge 1% late fee
```

**Late Payment Example:**
```
Payment due: Jan 15
Grace period: Jan 22 (7 days)
User pays: Jan 25 (3 days late)
Late fee: 75.37 * 0.01 = 0.75 MUSD
Total owed: 75.37 + 0.75 = 76.12 MUSD
```

---

### Phase 6: MUSD Repayment to Mezo

After installments are paid (or anytime):

```solidity
// User wants to unlock BTC
// Option 1: Repay partial MUSD
BorrowerOperations.repayMUSD(amount: 500 MUSD)
→ Reduces debt from 900 → 400 MUSD
→ Can withdraw some BTC collateral

// Option 2: Repay full MUSD and close Trove
BorrowerOperations.closeTrove()
→ Repays 900 MUSD + 1% interest
→ Unlocks all 0.01 BTC
→ BTC returned to user's wallet
```

---

### Phase 7: Offramp (Convert BTC → Fiat via MoonPay)

**Scenario: User wants to cash out**

```
User has BTC in wallet → Wants USD in bank account
                       ↓
Opens MoonPay Offramp widget
                       ↓
Sends BTC to MoonPay address
                       ↓
MoonPay sells BTC → Deposits USD to bank account
```

**MoonPay Offramp Flow:**
```
1. User clicks "Sell BTC" in dashboard
2. Opens MoonPay sell widget
3. User enters: Amount (0.005 BTC) → Destination (Bank Account)
4. User sends BTC to MoonPay deposit address
5. MoonPay confirms receipt
6. MoonPay sells BTC at market price (~$500)
7. USD deposited to user's bank account (minus fees)
```

---

## 🔄 Complete User Journey (With MoonPay)

### Scenario: User with NO crypto wants to buy a $1,200 MacBook

```
Step 1: User discovers BitBNPL merchant
├─ Browses merchant website
├─ Finds MacBook Pro ($1,200)
└─ Clicks "Pay with BitBNPL 🟠"

Step 2: Redirected to BitBNPL checkout
├─ Product: MacBook Pro - $1,200
├─ Installment options shown
└─ Selects: 6 payments ($202 × 6 = $1,212)

Step 3: Connect wallet (MetaMask/WalletConnect)
├─ User connects wallet: 0xABC...
└─ Wallet has 0 MUSD balance ❌

Step 4: Get MUSD → Need BTC first!
├─ Dashboard shows: "You need BTC collateral"
├─ Click "Buy BTC with MoonPay"
└─ MoonPay onramp widget opens

Step 5: MoonPay Onramp
├─ User enters credit card info
├─ Buys $1,500 worth of BTC
├─ Pays MoonPay fee (~3.5%)
└─ Receives ~0.015 BTC in wallet

Step 6: Deposit BTC to Mezo
├─ User deposits 0.015 BTC ($1,500)
├─ Mezo creates Trove (CDP)
├─ User borrows 1,200 MUSD (80% LTV - safe buffer)
└─ User now has 1,200 MUSD in wallet ✅

Step 7: Return to checkout
├─ System detects 1,200 MUSD balance
├─ User confirms 6-payment plan
└─ Click "Complete Purchase"

Step 8: Smart contract execution
├─ Platform pays merchant $1,188 (99%) INSTANTLY
├─ User owes platform $1,212 (1% interest)
├─ Payment schedule: $202 every 14 days × 6
└─ Merchant ships MacBook! 📦

Step 9: Make bi-weekly payments
├─ Day 14: Pay $202 (from MUSD balance)
├─ Day 28: Pay $202
├─ Day 42: Pay $202
├─ ... (User can borrow more MUSD if needed)
└─ Day 84: Final payment $202 → Complete! ✅

Step 10: After all payments (optional)
├─ User's BTC appreciated! Now worth $1,800
├─ User repays 1,200 MUSD to Mezo
├─ Unlocks 0.015 BTC (now worth $1,800)
└─ Net gain: $300 appreciation - kept Bitcoin exposure!

Step 11: Cash out (MoonPay Offramp - optional)
├─ User wants to realize profits
├─ Opens MoonPay sell widget
├─ Sells 0.015 BTC for $1,800
└─ USD deposited to bank account
```

---

## 🔐 Security & Verification

### Merchant Verification:

```javascript
// MerchantRegistry.sol
struct Merchant {
  address walletAddress;      // Unique identifier
  string businessName;
  string storeUrl;
  string category;
  bool isVerified;            // ← Admin must approve
  bool isActive;              // ← Can be deactivated
  uint256 totalSales;
  uint256 totalVolume;
}

// Only verified merchants can receive payments
modifier onlyVerifiedMerchant(address merchant) {
  require(
    merchantRegistry.isActiveMerchant(merchant),
    "Merchant not verified"
  );
  _;
}
```

**Checkout Verification:**
```typescript
// /checkout page
const { merchant } = useMerchantDetails(merchantAddress)

if (!merchant.isVerified || !merchant.isActive) {
  // Show error: "Merchant Not Verified"
  // Prevent purchase
  return <UnverifiedMerchantError />
}

// Proceed with checkout only if verified ✅
```

---

## 💸 Economics & Revenue Model

### For Users:
- **Interest to Mezo:** 1% APR on MUSD borrowed
- **Interest to Platform:** 0-1.5% on installments
  - 1 payment: 0%
  - 4 payments: 0.5%
  - 6 payments: 1.0%
  - 8 payments: 1.5%
- **Late fees:** 1% per late payment (after 7-day grace)

**Example:**
```
Purchase: $1,200 MacBook
Plan: 6 payments (1% interest)
Total owed: $1,212 ($1,200 + $12 interest)
Per payment: $202 every 14 days

User's BTC grows from $1,500 → $1,800 (20% gain)
Net benefit: $300 - $12 = $288 profit vs selling BTC!
```

### For Merchants:
- **Platform Fee:** 1% of sale
- **Settlement:** INSTANT (no waiting)
- **No chargebacks:** Crypto payments are final
- **Lower fees:** 1% vs 2.9% + $0.30 (Stripe)

**Example:**
```
Sale: $1,200 MacBook
Merchant receives: $1,188 (99%)
Platform fee: $12 (1%)
Received: INSTANTLY from liquidity pool ⚡
```

### For Platform (BitBNPL):
- **Platform fee:** 1% from each sale
- **Interest spread:** Earns 0-1.5% from installments
- **Late fees:** 1% per late payment

**Example Revenue:**
```
Transaction: $1,200 sale, 6 payments
Platform fee: $12 (1%)
Interest earned: $12 (1%)
Total revenue: $24 per transaction
If late payment: +$2 late fee

Monthly volume: $100,000
Monthly revenue: $2,000 (2% of volume)
```

---

## 📊 Smart Contract Architecture

### 1. MerchantRegistry.sol
```solidity
contract MerchantRegistry {
  mapping(address => Merchant) public merchants;

  // Register merchant
  function registerMerchant(
    string businessName,
    string storeUrl,
    string category,
    string logoText,
    string logoColor
  ) external;

  // Admin verifies merchant
  function verifyMerchant(address merchant) external onlyOwner;

  // Record transaction (called by InstallmentProcessor)
  function recordTransaction(
    address merchant,
    uint256 amount
  ) external;

  // Check if merchant can accept payments
  function isActiveMerchant(address merchant)
    public view returns (bool);
}
```

### 2. InstallmentProcessor.sol
```solidity
contract InstallmentProcessor {
  struct Purchase {
    address user;
    address merchant;
    uint256 amount;
    uint256 amountWithInterest;
    uint8 totalPayments;
    uint8 paymentsRemaining;
    uint256 perPayment;
    uint256 nextPaymentDue;
    bool isActive;
  }

  mapping(uint256 => Purchase) public purchases;
  uint256 public liquidityPool;  // Platform's MUSD reserve

  // User creates purchase
  function createPurchase(
    address merchant,
    uint256 amount,
    uint8 totalPayments,
    uint256 userBorrowingCapacity
  ) external returns (uint256 purchaseId);

  // User makes bi-weekly payment
  function makePayment(uint256 purchaseId) external;

  // Check if payment is late
  function isPaymentLate(uint256 purchaseId)
    public view returns (bool);

  // Admin manages liquidity
  function depositLiquidity(uint256 amount) external onlyOwner;
  function withdrawLiquidity(uint256 amount) external onlyOwner;
}
```

### 3. Mezo Contracts (External)
```solidity
// BorrowerOperations.sol
interface IBorrowerOperations {
  function openTrove(
    uint256 _maxFeePercentage,
    uint256 _MUSDAmount,
    address _upperHint,
    address _lowerHint
  ) external payable;

  function closeTrove() external;
  function repayMUSD(uint256 amount) external;
}

// TroveManager.sol
interface ITroveManager {
  function getTroveDebt(address borrower)
    external view returns (uint256);
  function getTroveCollateral(address borrower)
    external view returns (uint256);
}
```

---

## 🌐 MoonPay Integration (Implementation Plan)

### Frontend Integration:

```typescript
// /hooks/useMoonPay.ts
import { MoonPayBuyWidget, MoonPaySellWidget } from '@moonpay/moonpay-react'

export function useMoonPay() {
  const { address } = useAccount()

  const openBuyWidget = (amount: number) => {
    MoonPayBuyWidget.open({
      apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY,
      walletAddress: address,
      currencyCode: 'btc',
      baseCurrencyAmount: amount,
      redirectURL: `${window.location.origin}/dashboard?moonpay=success`,
    })
  }

  const openSellWidget = (amount: number) => {
    MoonPaySellWidget.open({
      apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY,
      baseCurrencyCode: 'btc',
      baseCurrencyAmount: amount,
      redirectURL: `${window.location.origin}/dashboard?moonpay=offramp-success`,
    })
  }

  return { openBuyWidget, openSellWidget }
}
```

```typescript
// /app/dashboard/page.tsx
import { useMoonPay } from '@/hooks/useMoonPay'

export default function Dashboard() {
  const { openBuyWidget, openSellWidget } = useMoonPay()
  const { collateralAmount } = useMezoContracts()

  return (
    <div>
      {/* Onramp: Buy BTC */}
      {parseFloat(collateralAmount) === 0 && (
        <Card>
          <h3>No BTC Collateral</h3>
          <p>Buy Bitcoin with your credit card to get started</p>
          <Button onClick={() => openBuyWidget(500)}>
            Buy $500 of BTC
          </Button>
        </Card>
      )}

      {/* Offramp: Sell BTC */}
      {parseFloat(collateralAmount) > 0 && (
        <Card>
          <h3>Cash Out</h3>
          <Button onClick={() => openSellWidget(0.01)}>
            Sell 0.01 BTC
          </Button>
        </Card>
      )}
    </div>
  )
}
```

---

## 🎯 Key Benefits

### For Users:
- ✅ Keep Bitcoin (benefit from price appreciation)
- ✅ Low interest rates (0.5-1.5% vs 20%+ credit cards)
- ✅ No credit check required
- ✅ Easy onramp via MoonPay (buy BTC with card)
- ✅ Easy offramp via MoonPay (sell BTC to bank)

### For Merchants:
- ✅ Instant settlement (paid immediately)
- ✅ Lower fees (1% vs 2.9%+)
- ✅ No chargebacks
- ✅ Easy integration (just add link)
- ✅ Access to crypto users

### For Platform:
- ✅ Revenue from fees (1% + interest)
- ✅ Liquidity pool earns returns
- ✅ Scalable business model
- ✅ No credit risk (collateral-backed)

---

## 📁 Project Structure

```
bitbnpl/
├── contracts/                    # Smart contracts
│   ├── src/
│   │   ├── InstallmentProcessor.sol    # BNPL payment logic
│   │   ├── MerchantRegistry.sol        # Merchant management
│   │   └── PaymentProcessor.sol        # Legacy (unused)
│   └── lib/                     # Dependencies (Mezo contracts)
│
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── page.tsx            # Homepage
│   │   ├── dashboard/          # User dashboard (MUSD management)
│   │   ├── marketplace/        # Browse verified merchants
│   │   ├── checkout/           # Purchase & installment selection
│   │   ├── admin/              # Platform admin panel
│   │   └── merchant/
│   │       ├── register/       # Merchant registration
│   │       └── dashboard/      # Merchant stats & integration
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── checkout/           # Checkout-specific components
│   │   └── dashboard/          # Dashboard components
│   ├── hooks/
│   │   ├── useMezoContracts.ts        # Mezo protocol integration
│   │   ├── useInstallmentProcessor.ts # BNPL contract hooks
│   │   ├── useMerchantRegistry.ts     # Merchant contract hooks
│   │   └── useAdminData.ts            # Admin data aggregation
│   ├── contexts/
│   │   └── CartContext.tsx     # Shopping cart state
│   └── lib/
│       └── abis/               # Contract ABIs
│
└── widget/                      # JavaScript widget (planned)
    └── src/
        ├── index.ts            # Widget entry point
        └── button.ts           # Button component
```

---

## 🚀 Deployment Information

### Network: Mezo Testnet (Matsnet)
- **Chain ID:** 31611
- **RPC:** https://rpc.test.mezo.org
- **Explorer:** https://explorer.test.mezo.org

### Deployed Contracts:
- **MerchantRegistry:** `0x6b3eDF2bDEe7D5B5aCbf849896A1d90a8fB98927`
- **InstallmentProcessor:** `0xEE4296C9Ad973F7CD61aBbB138976F3b597Fc0F4`
- **MUSD Token:** `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`

### Admin Wallet:
- **Address:** `0x51A4FDB15787bd43FE3C96c49e559526B637bC66`

---

## 🔄 User Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    BITBNPL USER FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. ONBOARDING
   └─ User buys BTC via MoonPay (if needed)

2. COLLATERALIZATION
   └─ Deposit BTC → Mezo → Borrow MUSD

3. SHOPPING
   └─ Browse merchant → Click "Pay with BitBNPL"

4. CHECKOUT
   ├─ Select installment plan (1, 4, 6, or 8 payments)
   ├─ Merchant verified ✅
   └─ Complete purchase

5. PAYMENT
   ├─ Merchant receives MUSD instantly
   └─ User pays bi-weekly installments

6. COMPLETION
   ├─ All payments made
   ├─ Repay MUSD to Mezo
   └─ Unlock BTC (appreciated value!)

7. OFFRAMP (optional)
   └─ Sell BTC via MoonPay → USD to bank
```

---

## 🛡️ Security Features

### Smart Contract Security:
- ✅ ReentrancyGuard on all money transfers
- ✅ CEI (Checks-Effects-Interactions) pattern
- ✅ Ownable for admin functions
- ✅ Merchant verification required
- ✅ Input validation

### Frontend Security:
- ✅ Merchant verification check before checkout
- ✅ Wallet address format validation
- ✅ Integration code only for verified merchants
- ✅ On-chain verification (can't be bypassed)

### User Protection:
- ✅ Collateral-backed (no unsecured debt)
- ✅ Transparent fees (shown upfront)
- ✅ No credit check required
- ✅ BTC stays in user's control (via Mezo)

---

## 📈 Future Roadmap

### Phase 1: MVP (Current)
- ✅ Smart contracts deployed
- ✅ Frontend integrated
- ✅ Merchant onboarding
- ✅ Checkout flow
- ⏳ Liquidity pool funding
- ⏳ First merchant transactions

### Phase 2: MoonPay Integration
- ⏳ Onramp (Buy BTC with fiat)
- ⏳ Offramp (Sell BTC to fiat)
- ⏳ Seamless user experience

### Phase 3: Widget & SDK
- ⏳ JavaScript widget
- ⏳ React/Next.js SDK
- ⏳ NPM package
- ⏳ WordPress plugin

### Phase 4: Advanced Features
- ⏳ Merchant analytics dashboard
- ⏳ Automatic payment reminders
- ⏳ Multi-currency support
- ⏳ Mobile app

### Phase 5: Mainnet Launch
- ⏳ Security audit
- ⏳ Mainnet deployment
- ⏳ Marketing campaign
- ⏳ Merchant partnerships

---

## 📞 Support & Documentation

- **GitHub:** https://github.com/your-repo/bitbnpl
- **Documentation:** https://docs.bitbnpl.com (planned)
- **Discord:** https://discord.gg/bitbnpl (planned)
- **Twitter:** @bitbnpl (planned)

---

## 📜 License

MIT License - See LICENSE file for details

---

**Built with:**
- ❤️ Bitcoin
- 🔷 Mezo Protocol
- ⚡ Next.js
- 💎 Solidity
- 🌙 MoonPay (planned)

---

*Last Updated: January 2025*
