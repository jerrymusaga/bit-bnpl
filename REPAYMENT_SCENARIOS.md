# InstallmentProcessor Contract - Repayment Analysis

## Overview
The InstallmentProcessor contract handles two payment flows:
1. **Pay in Full** (1 installment) - Direct payment from user to merchant
2. **Pay in Installments** (4, 6, or 8) - Platform fronts money, user pays back over time

---

## Contract Flow Architecture

### Two Payment Models:

#### **Model 1: Pay in Full (1 installment)**
```
User → MUSD → Merchant (95%) + Platform Fee (5%)
No platform liquidity used
No collateral required
Instant settlement
```

#### **Model 2: Pay in Installments (4, 6, or 8)**
```
Platform → MUSD → Merchant (instant)
User → Pays back → Platform (bi-weekly installments)
Requires BTC collateral via Mezo
Platform liquidity pool fronts the money
```

---

## Repayment Function: `makePayment()`

**Location**: Lines 272-312

### Function Flow:

```solidity
function makePayment(uint256 purchaseId) external nonReentrant {
    // 1. Load purchase
    Purchase storage purchase = userPurchases[msg.sender][purchaseId];

    // 2. Validate
    require(purchase.isActive, "Purchase not active");
    require(purchase.paymentsRemaining > 0, "Already paid off");

    // 3. Calculate payment amount
    uint256 paymentAmount = purchase.amountPerPayment;

    // 4. Check for late fees
    if (block.timestamp > purchase.nextPaymentDue + GRACE_PERIOD) {
        uint256 lateFee = (paymentAmount * 1%) / 100;
        purchase.lateFees += lateFee;
        paymentAmount += lateFee;
    }

    // 5. Update state
    purchase.paymentsRemaining--;
    purchase.nextPaymentDue = block.timestamp + 2 weeks;
    liquidityPool += paymentAmount;

    // 6. Check completion
    if (purchase.paymentsRemaining == 0) {
        purchase.isActive = false;
    }

    // 7. Transfer MUSD from user to contract
    MUSD.transferFrom(msg.sender, address(this), paymentAmount);

    // 8. Emit events
}
```

---

## Repayment Scenarios

### Scenario 1: On-Time Payment ✅

**Setup:**
- User bought $100 item with 4 installments
- Interest: 0.5% = $0.50
- Total owed: $100.50
- Per payment: $25.125
- Payment due: Every 2 weeks

**Timeline:**

```
Day 0: Purchase created
  - Platform pays merchant $95 (100 - 5% fee)
  - Platform keeps $5 fee
  - User owes platform $100.50
  - Next payment due: Day 14

Day 14: First payment
  - User calls makePayment(0)
  - User pays $25.125
  - Payments remaining: 3
  - Next payment due: Day 28

Day 28: Second payment
  - User calls makePayment(0)
  - User pays $25.125
  - Payments remaining: 2
  - Next payment due: Day 42

Day 42: Third payment
  - User calls makePayment(0)
  - User pays $25.125
  - Payments remaining: 1
  - Next payment due: Day 56

Day 56: Final payment
  - User calls makePayment(0)
  - User pays $25.125
  - Payments remaining: 0
  - isActive = false
  - Purchase completed! ✅
```

**Result:**
- ✅ User paid back $100.50 to platform
- ✅ Platform recovered initial $95 + $5.50 profit
- ✅ No late fees

---

### Scenario 2: Late Payment (Within Grace Period) ⚠️

**Setup:**
- Same as Scenario 1
- Grace period: 1 week after due date
- Late fee: 1% of payment amount

**Timeline:**

```
Day 0: Purchase created
Day 14: Payment due (but user doesn't pay)
Day 15-21: Grace period (no penalty yet)
Day 20: User pays within grace period

makePayment() executes:
  - block.timestamp = Day 20
  - nextPaymentDue = Day 14
  - GRACE_PERIOD = 7 days
  - Day 20 <= Day 21 → No late fee! ✅
  - User pays normal $25.125
```

**Result:**
- ⚠️ User paid late but within grace period
- ✅ No penalty applied
- ✅ Next payment due: Day 34 (20 + 14)

---

### Scenario 3: Late Payment (After Grace Period) ❌

**Setup:**
- Same as Scenario 1
- User misses grace period

**Timeline:**

```
Day 0: Purchase created
Day 14: Payment due (user doesn't pay)
Day 21: Grace period ends
Day 25: User finally pays (11 days late)

makePayment() executes:
  - block.timestamp = Day 25
  - nextPaymentDue = Day 14
  - GRACE_PERIOD = 7 days
  - Day 25 > Day 21 → LATE! ❌

  Late fee calculation:
  - lateFee = ($25.125 * 100) / 10000 = $0.25125
  - paymentAmount = $25.125 + $0.25125 = $25.37625

  User pays: $25.37625 (instead of $25.125)
```

**Result:**
- ❌ User paid $0.25 late fee (1%)
- ⚠️ Late fees accumulate in purchase.lateFees
- ✅ Next payment due: Day 39 (25 + 14)

---

### Scenario 4: Multiple Late Payments (Compounding Fees) 💰

**Setup:**
- User consistently pays late
- Late fees accumulate

**Timeline:**

```
Payment 1 (Day 25, 11 days late):
  - Base: $25.125
  - Late fee: $0.25125
  - Total paid: $25.37625
  - Accumulated late fees: $0.25125

Payment 2 (Day 53, 11 days late again):
  - Base: $25.125
  - Late fee: $0.25125
  - Total paid: $25.37625
  - Accumulated late fees: $0.50250

Payment 3 (Day 81, on time):
  - Base: $25.125
  - Late fee: $0
  - Total paid: $25.125
  - Accumulated late fees: $0.50250 (unchanged)

Final Payment (Day 95, on time):
  - Base: $25.125
  - Late fee: $0
  - Total paid: $25.125
  - Accumulated late fees: $0.50250

Total paid: $101.00250 (instead of $100.50)
Extra cost: $0.50250 in late fees
```

**Result:**
- 💰 Platform earned extra $0.50 from late fees
- ⚠️ User paid more due to being late
- ✅ Purchase still completed

---

### Scenario 5: Attempting Payment After Completion ❌

**Setup:**
- User already paid all 4 installments
- Tries to pay again

**Code Flow:**

```solidity
function makePayment(uint256 purchaseId) {
    Purchase storage purchase = userPurchases[msg.sender][purchaseId];

    // First check: isActive
    require(purchase.isActive, "Purchase not active");
    // ❌ REVERTS HERE because isActive = false after final payment

    // Second check: paymentsRemaining
    require(purchase.paymentsRemaining > 0, "Already paid off");
    // Would also fail because paymentsRemaining = 0
}
```

**Result:**
- ❌ Transaction reverts with "Purchase not active"
- ✅ User cannot accidentally overpay
- ✅ Gas refunded (minus base cost)

---

### Scenario 6: Wrong User Tries to Pay ❌

**Setup:**
- Alice bought item
- Bob tries to make payment on Alice's purchase

**Code Flow:**

```solidity
function makePayment(uint256 purchaseId) {
    // Loads Bob's purchases, not Alice's
    Purchase storage purchase = userPurchases[msg.sender][purchaseId];
    // msg.sender = Bob's address

    // Bob doesn't have a purchase with this ID
    require(purchase.isActive, "Purchase not active");
    // ❌ REVERTS because Bob's purchase[purchaseId] doesn't exist
    // (default values: isActive = false)
}
```

**Result:**
- ❌ Bob cannot pay Alice's installments
- ✅ Security: Each user can only pay their own purchases
- ✅ Prevents unauthorized payments

---

### Scenario 7: Insufficient MUSD Balance ❌

**Setup:**
- User has active purchase
- Payment due: $25.125
- User's MUSD balance: $20

**Code Flow:**

```solidity
function makePayment(uint256 purchaseId) {
    // ... validation passes ...

    uint256 paymentAmount = purchase.amountPerPayment; // $25.125

    // ... state updates ...

    // Transfer MUSD from user to contract
    require(
        MUSD.transferFrom(msg.sender, address(this), paymentAmount),
        "Payment transfer failed"
    );
    // ❌ REVERTS HERE because user doesn't have enough MUSD
}
```

**User Action Required:**
1. Go to dashboard
2. Borrow more MUSD from Mezo (against BTC collateral)
3. Try payment again

**Result:**
- ❌ Payment fails, transaction reverts
- ⚠️ Payment still marked as late if beyond grace period
- ⚠️ User needs to borrow more MUSD to pay

---

### Scenario 8: Early Repayment (Multiple Payments at Once) ⚠️

**Current Contract:**
The contract **does not support** paying multiple installments at once.

**What Happens:**

```
User wants to pay off entire loan early:
  - Total remaining: $75.375 (3 payments of $25.125)
  - User calls makePayment() once
  - Only pays: $25.125 (single payment)
  - Still owes: 2 more payments

To pay in full early, user must:
  - Call makePayment() 3 times in sequence
  - Pay $25.125 each time
  - Wait for each transaction to confirm
```

**Limitation:**
- ⚠️ No bulk repayment function
- ⚠️ Cannot pay off loan early in one transaction
- ⚠️ Must make payments individually

**Potential Enhancement:**
Add `repayInFull()` function to pay all remaining at once.

---

## Key Contract Variables

### Purchase Struct (Line 33-45)

```solidity
struct Purchase {
    address user;                // Buyer's wallet
    address merchant;            // Merchant's wallet
    uint256 totalAmount;         // Original price (e.g., $100)
    uint256 totalWithInterest;   // With interest (e.g., $100.50)
    uint256 amountPerPayment;    // Per installment (e.g., $25.125)
    uint8 paymentsTotal;         // Total payments (e.g., 4)
    uint8 paymentsRemaining;     // Left to pay (e.g., 2)
    uint256 nextPaymentDue;      // Unix timestamp
    uint256 collateralLocked;    // BTC collateral amount
    uint256 lateFees;            // Accumulated late fees
    bool isActive;               // Is purchase still active?
}
```

### Constants (Lines 28-31)

```solidity
PAYMENT_INTERVAL = 2 weeks;           // 1,209,600 seconds
GRACE_PERIOD = 1 week;                // 604,800 seconds
LATE_FEE_PERCENTAGE = 100;            // 1% (100 basis points)
BASIS_POINTS = 10000;                 // Denominator
```

---

## State Transitions

### Purchase Lifecycle:

```
┌─────────────┐
│   Created   │ isActive = true, paymentsRemaining = 4
└──────┬──────┘
       │
       │ makePayment() called
       ▼
┌─────────────┐
│ 1st Payment │ isActive = true, paymentsRemaining = 3
└──────┬──────┘
       │
       │ makePayment() called
       ▼
┌─────────────┐
│ 2nd Payment │ isActive = true, paymentsRemaining = 2
└──────┬──────┘
       │
       │ makePayment() called
       ▼
┌─────────────┐
│ 3rd Payment │ isActive = true, paymentsRemaining = 1
└──────┬──────┘
       │
       │ makePayment() called (final)
       ▼
┌─────────────┐
│  Completed  │ isActive = false, paymentsRemaining = 0
└─────────────┘
       │
       │ Cannot call makePayment() anymore
       ▼
    [ENDED]
```

---

## Money Flow Diagrams

### Installment Purchase Flow:

```
CREATION (Day 0):
┌──────────┐                    ┌──────────────┐
│ Platform │ ──── $95 ────────► │   Merchant   │
│          │                    └──────────────┘
│ Liquidity│
│   Pool   │ ──── $5 ─────────► Platform Fee Wallet
└──────────┘
     ▲
     │
     │ Debt: $100.50
     │
┌──────────┐
│   User   │ (Has BTC collateral in Mezo)
└──────────┘

REPAYMENT (Every 2 weeks):
┌──────────┐
│   User   │ ──── $25.125 ────► Platform Liquidity Pool
└──────────┘

COMPLETION (After 4 payments):
┌──────────┐
│   User   │ ──── Total: $100.50 ────► Platform
└──────────┘                            (Recovered $95 + $5.50 profit)
```

---

## Edge Cases & Security

### ✅ Protected Against:

1. **Double Payment Prevention**
   - `paymentsRemaining` decremented before transfer
   - CEI pattern (Check-Effects-Interactions)

2. **Reentrancy Protection**
   - `nonReentrant` modifier
   - State updates before external calls

3. **Unauthorized Payments**
   - Uses `msg.sender` to look up purchases
   - Each user can only access their own purchases

4. **Integer Overflow**
   - Solidity 0.8+ has built-in overflow checks
   - SafeMath not needed

5. **Zero Value Attacks**
   - Cannot create $0 purchases
   - Payment amount calculated, cannot be 0

### ⚠️ Considerations:

1. **No Partial Payments**
   - Must pay full installment amount
   - Cannot pay $10 of a $25 payment

2. **No Early Repayment Discount**
   - Paying early doesn't reduce interest
   - Full interest charged upfront

3. **Grace Period Always Applied**
   - 1 week buffer before late fees
   - Cannot be customized per user

4. **No Payment Reminders**
   - Off-chain system needed for notifications
   - Contract doesn't emit "payment due" events

---

## Summary Table

| Scenario | User Action | Late Fee | Result |
|----------|-------------|----------|--------|
| On-time payment | Pay exactly on due date | $0 | ✅ Success |
| Within grace period | Pay 1-7 days late | $0 | ✅ Success |
| After grace period | Pay 8+ days late | 1% of payment | ⚠️ Success + fee |
| Multiple late payments | Consistently late | 1% per late payment | ⚠️ Success + fees |
| Already completed | Try to pay again | N/A | ❌ Reverts |
| Wrong user | Bob pays Alice's loan | N/A | ❌ Reverts |
| Insufficient MUSD | Not enough balance | N/A | ❌ Reverts |
| Early full repayment | Call makePayment() multiple times | $0 | ✅ Success (tedious) |

---

## Gas Costs Estimation

| Operation | Gas Used | Notes |
|-----------|----------|-------|
| `makePayment()` (first time) | ~80,000 | Includes state updates + MUSD transfer |
| `makePayment()` (subsequent) | ~65,000 | Less initial storage writes |
| `makePayment()` (with late fee) | ~90,000 | Extra late fee calculation + storage |
| `makePayment()` (final) | ~85,000 | Marks purchase as inactive |

---

## Frontend Integration Tips

### For User Dashboard:

```typescript
// Check if payment is due
const isPaymentDue = currentTime >= nextPaymentDue

// Check if in grace period
const isInGracePeriod =
  currentTime > nextPaymentDue &&
  currentTime <= nextPaymentDue + GRACE_PERIOD

// Calculate late fee
const isLate = currentTime > nextPaymentDue + GRACE_PERIOD
const lateFee = isLate ? (amountPerPayment * 0.01) : 0

// Show payment amount
const totalDue = amountPerPayment + lateFee
```

### For Payment Button:

```typescript
// Enable button only if:
1. purchase.isActive === true
2. purchase.paymentsRemaining > 0
3. user has enough MUSD balance

// Disable if:
1. Already completed
2. Insufficient MUSD
3. Transaction pending
```

---

## Recommended Improvements

### 1. Bulk Repayment Function
```solidity
function repayInFull(uint256 purchaseId) external {
    // Pay all remaining installments at once
    // Could offer small discount for early repayment
}
```

### 2. Payment Reminder Events
```solidity
// Emit event 1 day before due date
event PaymentDueSoon(address user, uint256 purchaseId, uint256 dueDate);
```

### 3. Partial Payment Support
```solidity
function makePartialPayment(uint256 purchaseId, uint256 amount) external {
    // Allow paying less than full installment
    // Track partial balance
}
```

### 4. Grace Period Configuration
```solidity
mapping(address => uint256) public userGracePeriods;
// Allow customizing grace period per user (VIP users get longer)
```

---

## Testing Checklist

- [ ] Make on-time payment
- [ ] Make payment within grace period
- [ ] Make payment after grace period (check late fee)
- [ ] Complete all payments (check isActive = false)
- [ ] Try payment after completion (should revert)
- [ ] Try payment with insufficient MUSD (should revert)
- [ ] Check late fees accumulate correctly
- [ ] Check nextPaymentDue updates correctly
- [ ] Check liquidityPool increases after each payment
- [ ] Verify events are emitted correctly

---

## Conclusion

The repayment system is **solid and secure** with proper checks for:
- ✅ Late payment penalties
- ✅ Grace period handling
- ✅ State management
- ✅ Security (reentrancy, overflow, unauthorized access)

**Main limitation**: No bulk repayment - users must pay installments one at a time.

The contract follows best practices (CEI pattern, reentrancy guards, checks-effects-interactions) and properly manages the lifecycle of installment purchases from creation through completion.
