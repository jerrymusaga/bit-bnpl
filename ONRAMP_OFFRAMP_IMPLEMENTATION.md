# BitBNPL Onramp/Offramp Implementation Plan

## 🎯 Goal
Enable users without crypto to use BitBNPL by integrating fiat onramp/offramp solutions.

## 🔍 Problem Analysis

### Current State
- ✅ Users can use BitBNPL if they have BTC/MUSD
- ❌ Users without crypto are blocked
- ❌ No way to buy BTC with fiat (credit card, bank transfer)
- ❌ No way to cash out BTC to fiat

### Target Users
1. **New crypto users**: Have USD but no BTC
2. **Merchants**: Want to receive payments in USD, not crypto
3. **Borrowers**: Want to cash out after getting paid

## 📊 Integration Options

### Option 1: MoonPay (Recommended)
**Pros:**
- Most popular onramp/offramp provider
- Easy SDK integration
- Supports 160+ countries
- Credit card, bank transfer, Apple Pay
- Both buy (onramp) and sell (offramp)

**Cons:**
- Requires KYC
- 3-5% fees
- Need API key (free for testnet)

**Technical:**
```
npm install @moonpay/moonpay-react
```

### Option 2: Ramp Network
**Pros:**
- Lower fees (0.5-2.9%)
- Better UX
- Faster KYC

**Cons:**
- Smaller coverage
- Limited payment methods

### Option 3: Transak
**Pros:**
- Good for NFT/Web3 projects
- Multiple payment methods

**Cons:**
- Higher fees
- Complex setup

### Option 4: Coinbase Onramp
**Pros:**
- Trusted brand
- Already integrated with Base
- No separate KYC if user has Coinbase account

**Cons:**
- Only onramp (no offramp)
- Requires Coinbase account

**Recommendation: Start with MoonPay, add Coinbase Onramp as alternative**

---

## 🏗️ Architecture Design

### User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     NEW USER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

1. User lands on marketplace
   └─ Sees product for $500
   └─ Clicks "Pay with BitBNPL"

2. Checkout page detects no BTC/MUSD
   ┌────────────────────────────────┐
   │  ⚠️  You need BTC to continue  │
   │                                 │
   │  [ Buy BTC with Card 💳 ]      │
   │  [ I have BTC ] (skip)         │
   └────────────────────────────────┘

3. User clicks "Buy BTC with Card"
   └─ MoonPay widget opens (modal)
   └─ User enters credit card info
   └─ Buys 0.01 BTC ($1,000)
   └─ BTC sent to user's wallet

4. Returns to checkout
   └─ Now has BTC → Can proceed
   └─ Locks BTC as collateral
   └─ Gets borrowing capacity
   └─ Completes purchase

5. Later: User wants to cash out
   └─ Goes to dashboard
   └─ Clicks "Sell BTC"
   └─ MoonPay offramp widget
   └─ USD sent to bank account
```

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. OnrampButton Component                                  │
│     - Detects if user has BTC                               │
│     - Shows "Buy BTC" if needed                             │
│     - Opens MoonPay widget                                  │
│                                                              │
│  2. OfframpButton Component                                 │
│     - Shows "Sell BTC" in dashboard                         │
│     - Opens MoonPay sell widget                             │
│     - Shows bank account deposit status                     │
│                                                              │
│  3. OnrampStatusModal                                       │
│     - Shows purchase progress                               │
│     - "Waiting for BTC..." → "Received!" → "Continue"       │
│                                                              │
│  4. CheckoutEnhancement                                     │
│     - Detects low balance                                   │
│     - Suggests buying BTC                                   │
│     - Calculates how much BTC needed                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    BACKEND/HOOKS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. useMoonPay Hook                                         │
│     - Initialize MoonPay SDK                                │
│     - Handle buy/sell events                                │
│     - Track transaction status                              │
│                                                              │
│  2. useOnrampStatus Hook                                    │
│     - Poll for BTC receipt                                  │
│     - Update UI when BTC arrives                            │
│     - Trigger success callback                              │
│                                                              │
│  3. Balance Detection                                       │
│     - Check BTC balance                                     │
│     - Calculate required amount                             │
│     - Show onramp suggestion                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Implementation

### Phase 1: Setup & Configuration (30 min)

#### Step 1.1: Get MoonPay API Key
```bash
1. Go to https://www.moonpay.com/dashboard/getting-started
2. Sign up for developer account
3. Get publishable API key (free for testnet)
4. Add to .env.local:
   NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_xxxxx
```

#### Step 1.2: Install Dependencies
```bash
npm install @moonpay/moonpay-react
# or use MoonPay SDK directly (lighter)
npm install @moonpay/moonpay-sdk
```

#### Step 1.3: Configure Environment
```typescript
// /frontend/lib/moonpay-config.ts
export const MOONPAY_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY!,
  environment: 'sandbox', // Change to 'production' later
  defaultCurrency: 'USD',
  defaultCrypto: 'BTC',
  walletAddress: '', // Will be filled dynamically
  redirectURL: `${window.location.origin}/dashboard?moonpay=success`,
}
```

### Phase 2: Create Onramp Components (1-2 hours)

#### Step 2.1: Create MoonPay Hook
```typescript
// /frontend/hooks/useMoonPay.ts
import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'

export function useMoonPay() {
  const { address } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const openBuyWidget = useCallback((amount?: number) => {
    if (!address) {
      alert('Please connect wallet first')
      return
    }

    const moonpayUrl = new URL('https://buy-sandbox.moonpay.com')
    moonpayUrl.searchParams.set('apiKey', MOONPAY_CONFIG.apiKey)
    moonpayUrl.searchParams.set('currencyCode', 'btc')
    moonpayUrl.searchParams.set('walletAddress', address)
    moonpayUrl.searchParams.set('redirectURL', MOONPAY_CONFIG.redirectURL)

    if (amount) {
      moonpayUrl.searchParams.set('baseCurrencyAmount', amount.toString())
    }

    // Open in popup or iframe
    window.open(moonpayUrl.toString(), 'moonpay', 'width=500,height=700')
    setIsOpen(true)
  }, [address])

  const openSellWidget = useCallback(() => {
    // Similar for offramp
    const moonpayUrl = new URL('https://sell-sandbox.moonpay.com')
    // ... configure offramp
    window.open(moonpayUrl.toString(), 'moonpay', 'width=500,height=700')
  }, [address])

  return {
    openBuyWidget,
    openSellWidget,
    isOpen,
    transactionId,
  }
}
```

#### Step 2.2: Create Onramp Button Component
```typescript
// /frontend/components/onramp/OnrampButton.tsx
'use client'

import { Button } from '@/components/ui'
import { CreditCard } from 'lucide-react'
import { useMoonPay } from '@/hooks/useMoonPay'

interface OnrampButtonProps {
  amount?: number
  label?: string
  variant?: 'default' | 'accent'
  onSuccess?: () => void
}

export function OnrampButton({
  amount,
  label = 'Buy BTC with Card',
  variant = 'accent',
  onSuccess
}: OnrampButtonProps) {
  const { openBuyWidget } = useMoonPay()

  return (
    <Button
      variant={variant}
      onClick={() => openBuyWidget(amount)}
    >
      <CreditCard className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
```

#### Step 2.3: Create Balance Detection Component
```typescript
// /frontend/components/onramp/OnrampSuggestion.tsx
'use client'

import { Card } from '@/components/ui'
import { AlertCircle } from 'lucide-react'
import { OnrampButton } from './OnrampButton'
import { useMezoContracts } from '@/hooks/useMezoContracts'

interface OnrampSuggestionProps {
  requiredAmount: number
  onSuccess?: () => void
}

export function OnrampSuggestion({ requiredAmount, onSuccess }: OnrampSuggestionProps) {
  const { collateralAmount, btcPrice } = useMezoContracts()

  const hasEnough = parseFloat(collateralAmount) >= requiredAmount

  if (hasEnough) return null

  const neededBTC = requiredAmount - parseFloat(collateralAmount)
  const neededUSD = neededBTC * parseFloat(btcPrice)

  return (
    <Card padding="lg" className="bg-orange-500/10 border-orange-500/20">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-300 mb-2">
            Need More BTC to Continue
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            You need {neededBTC.toFixed(4)} BTC (~${neededUSD.toFixed(2)})
            to use this payment plan.
          </p>
          <OnrampButton
            amount={neededUSD}
            onSuccess={onSuccess}
          />
          <p className="text-xs text-[var(--text-muted)] mt-3">
            💳 Buy BTC instantly with credit card via MoonPay
          </p>
        </div>
      </div>
    </Card>
  )
}
```

### Phase 3: Integrate into Checkout (30 min)

#### Step 3.1: Update Checkout Page
```typescript
// In /frontend/app/checkout/page.tsx
import { OnrampSuggestion } from '@/components/onramp/OnrampSuggestion'

// ... existing code ...

// After payment plan selection, before complete purchase button:
{!canAfford && (
  <div className="space-y-4">
    {/* Existing error messages */}

    {/* NEW: Onramp suggestion */}
    <OnrampSuggestion
      requiredAmount={total}
      onSuccess={() => {
        // Refresh balance
        // Show success message
      }}
    />
  </div>
)}
```

### Phase 4: Add to Dashboard (30 min)

#### Step 4.1: Add Onramp/Offramp Section to User Dashboard
```typescript
// In /frontend/app/dashboard/page.tsx

<Card padding="lg">
  <CardHeader>
    <CardTitle>Manage Your BTC</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <OnrampButton label="Buy BTC" />
      <OfframpButton label="Sell BTC" />
    </div>
  </CardContent>
</Card>
```

### Phase 5: Handle Success Callbacks (1 hour)

#### Step 5.1: Create Success Handler
```typescript
// /frontend/app/dashboard/page.tsx

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const moonpayStatus = urlParams.get('moonpay')

  if (moonpayStatus === 'success') {
    // Show success toast
    toast.success('BTC purchase successful! Your funds will arrive shortly.')

    // Start polling for balance update
    const interval = setInterval(async () => {
      // Refetch BTC balance
      const newBalance = await refetchBalance()
      if (newBalance > previousBalance) {
        toast.success('BTC received! You can now make purchases.')
        clearInterval(interval)
      }
    }, 10000) // Check every 10 seconds

    // Stop after 5 minutes
    setTimeout(() => clearInterval(interval), 300000)

    // Clean URL
    window.history.replaceState({}, '', '/dashboard')
  }
}, [])
```

### Phase 6: Merchant Offramp (Optional - 1 hour)

#### Step 6.1: Add "Cash Out" to Merchant Dashboard
```typescript
// /frontend/app/merchant/dashboard/page.tsx

<Card padding="lg">
  <CardHeader>
    <CardTitle>Cash Out Earnings</CardTitle>
  </CardHeader>
  <CardContent>
    <p>MUSD Balance: {musdBalance}</p>
    <div className="space-y-3">
      {/* Step 1: Convert MUSD to BTC (use DEX/swap) */}
      <Button onClick={swapMUSDtoBTC}>
        1. Convert MUSD to BTC
      </Button>

      {/* Step 2: Sell BTC for USD */}
      <OfframpButton label="2. Cash Out to Bank" />
    </div>
  </CardContent>
</Card>
```

---

## 🎨 UX Improvements

### Smart Suggestions
```typescript
// Detect if user is new to crypto
const isNewUser = collateralAmount === 0 && musdBalance === 0

if (isNewUser) {
  return (
    <WelcomeModal>
      <h2>Welcome to BitBNPL!</h2>
      <p>To get started, you'll need some Bitcoin.</p>
      <OnrampButton label="Buy BTC with Card (2 min)" />
      <button onClick={skip}>I already have BTC</button>
    </WelcomeModal>
  )
}
```

### Progress Indicator
```typescript
<OnrampProgress
  steps={[
    'Enter payment info',
    'Waiting for BTC',
    'BTC received!',
    'Ready to shop'
  ]}
  currentStep={2}
/>
```

---

## 🧪 Testing Plan

### Test Cases
1. **Buy BTC Flow**
   - [ ] Opens MoonPay widget correctly
   - [ ] Passes correct wallet address
   - [ ] Redirects back with success status
   - [ ] Balance updates after purchase

2. **Sell BTC Flow**
   - [ ] Opens offramp widget
   - [ ] Shows correct BTC amount
   - [ ] Handles bank account info

3. **Error Handling**
   - [ ] User cancels purchase
   - [ ] Payment fails
   - [ ] KYC required
   - [ ] Insufficient funds

4. **Edge Cases**
   - [ ] User already has enough BTC (don't show onramp)
   - [ ] MoonPay down/unavailable
   - [ ] Multiple tabs open

---

## 📊 Estimated Time

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup & API keys | 30 min |
| 2 | Create components | 2 hours |
| 3 | Integrate checkout | 30 min |
| 4 | Add to dashboard | 30 min |
| 5 | Success handling | 1 hour |
| 6 | Merchant offramp | 1 hour |
| **Total** | | **~5.5 hours** |

---

## 💰 Cost Analysis

### MoonPay Fees
- **Onramp**: 3.5-4.5% + network fees
- **Offramp**: 3-5% + withdrawal fees
- **KYC**: Free (built-in)

### Example Transaction
```
User buys $1,000 of BTC
├─ MoonPay fee: $35-45
├─ Network fee: ~$2-5
└─ User receives: ~$950-963 in BTC
```

### Alternative: Subsidize Fees
```typescript
// Platform covers first onramp
if (isFirstPurchase) {
  showMessage('First BTC purchase fee covered by BitBNPL!')
  // Reimburse via platform tokens/credits
}
```

---

## 🚀 Deployment Checklist

### Before Going Live
- [ ] Get production MoonPay API key
- [ ] Update environment to 'production'
- [ ] Test with real money (small amount)
- [ ] Add error monitoring (Sentry)
- [ ] Update Terms of Service (mention MoonPay)
- [ ] Add fee disclosure
- [ ] Test KYC flow
- [ ] Add analytics tracking

### Post-Launch
- [ ] Monitor conversion rates
- [ ] Track drop-off points
- [ ] Measure time-to-first-purchase
- [ ] Collect user feedback
- [ ] Consider adding more onramp providers

---

## 🎯 Success Metrics

### Key Metrics to Track
1. **Onramp Conversion Rate**: % of users who complete onramp
2. **Time to BTC Receipt**: Average time from purchase to wallet
3. **Abandonment Rate**: % who start but don't complete
4. **Average Purchase Size**: How much BTC users buy
5. **Repeat Usage**: % who use onramp multiple times

### Goals
- 🎯 >60% onramp completion rate
- 🎯 <10 min average time to BTC receipt
- 🎯 <20% abandonment rate
- 🎯 $500+ average purchase size

---

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Apple Pay integration
- [ ] Bank transfer (ACH) - lower fees
- [ ] SEPA for Europe
- [ ] Crypto-to-crypto swap (DEX integration)
- [ ] Batch merchant payouts
- [ ] Automatic merchant offramp scheduling
- [ ] Tax reporting integration
- [ ] Multi-currency support

### Advanced Features
- [ ] Save payment methods
- [ ] Recurring purchases (DCA)
- [ ] Price alerts
- [ ] Instant swap MUSD ↔ BTC
- [ ] Yield on idle balance

---

## ❓ FAQ for Judges/Users

**Q: Why not just accept credit cards directly?**
A: BitBNPL leverages Bitcoin's properties (censorship resistance, programmability, global access). Onramp is just the entry point.

**Q: Do users need to understand Bitcoin?**
A: No! They click "Buy with Card", get BTC automatically, and we handle the rest.

**Q: What if BTC price drops during purchase?**
A: Onramp purchases are instant at quoted price. Price risk only starts after BTC is in wallet.

**Q: Can merchants receive USD directly?**
A: Yes! Merchants can use auto-offramp to convert MUSD → BTC → USD automatically.

**Q: Is KYC required?**
A: Yes, for regulatory compliance. MoonPay handles this (name, DOB, ID photo).

---

## 🎬 Demo Script (For Hackathon)

```
1. "Let me show you how a new user with no crypto can use BitBNPL..."

2. Click on a $500 product → Checkout

3. System detects: "You need BTC to continue"

4. Click "Buy BTC with Card"

5. MoonPay widget appears (in sandbox, use test card)

6. [Fast forward] "BTC received!"

7. Now user can complete purchase with installments

8. "And when they want to cash out, they just click Sell BTC"

9. Shows offramp widget → USD to bank account

10. "This makes BitBNPL accessible to anyone with a credit card, not just crypto natives"
```

---

## 📚 Resources

- MoonPay Docs: https://docs.moonpay.com
- MoonPay SDK: https://github.com/moonpay/moonpay-sdk
- Test Cards: https://docs.moonpay.com/moonpay/testing
- Ramp Docs: https://docs.ramp.network
- Coinbase Onramp: https://www.coinbase.com/cloud/products/onramp

---

**Status: PLANNED (Not Implemented)**
**Priority: HIGH (Post-hackathon)**
**Effort: ~5-6 hours**
