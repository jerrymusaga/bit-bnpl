# Transaction Fix Status

## ✅ What's Been Fixed

### 1. **AddCollateralModal** - FIXED
- ✅ Now passes user's BTC amount to `borrowMUSD()` instead of hardcoded `0.1 BTC`
- ✅ Transaction confirmation tracking with `useWaitForTransactionReceipt`
- ✅ Proper UI states:
  - "Waiting for wallet..." when user needs to sign
  - "Confirming..." when transaction is on-chain
  - "Success!" when confirmed
  - Auto-closes modal 2 seconds after confirmation
- ✅ Shows transaction hash
- ✅ Error handling for rejections

### 2. **BTC Price** - Still Hardcoded (Known Issue)
The USD value shown is using `const btcPrice = 83333` which is hardcoded. This is mentioned in [MEZO_INTEGRATION_STATUS.md](MEZO_INTEGRATION_STATUS.md#what-s-still-mock-data-).

**To fix**: We need to integrate Mezo's PriceFeed contract or Chainlink oracle.

---

## 🔧 What Still Needs Work

### BorrowMUSDModal & RepayMUSDModal
These modals need the same transaction confirmation flow as AddCollateralModal:
- Add `useWaitForTransactionReceipt` hook
- Add `useEffect` to auto-close on success
- Update button states (Waiting/Confirming/Success)
- Remove premature "success" message

### Contract Function Issue
**Problem**: The `borrowMUSD` function now requires BTC collateral as the second parameter, but:
- ✅ **AddCollateralModal (Opening new trove)** - Needs BTC amount ✓ Fixed!
- ❌ **BorrowMUSDModal (Borrowing more against existing collateral)** - Should NOT require BTC

**Solution Needed**:
We need to check if Mezo's BorrowerOperations has an `adjustTrove` function for borrowing more MUSD without adding collateral. Looking at typical Liquity/Mezo architecture, there should be:

```solidity
function openTrove(...) // Open new trove with BTC + borrow MUSD
function adjustTrove(...) // Adjust existing trove (add/remove collateral OR borrow/repay MUSD)
function closeTrove() // Close trove completely
```

We need to update `useMezoContracts.ts` to add an `adjustTrove` function.

---

## 🎯 Next Steps

### High Priority
1. **Add `adjustTrove` function to useMezoContracts**
   - Check Mezo BorrowerOperations ABI for the correct function
   - Allow borrowing more MUSD without sending BTC
   - Allow adding BTC without borrowing more MUSD

2. **Fix BorrowMUSDModal**
   - Use `adjustTrove` instead of `borrowMUSD`
   - Add transaction confirmation flow
   - Update UI states

3. **Fix RepayMUSDModal**
   - Add transaction confirmation flow
   - Update UI states

### Medium Priority
4. **Integrate Price Oracle**
   - Read from Mezo's PriceFeed contract
   - Remove hardcoded `$83,333` BTC price
   - Show real-time BTC/USD price

5. **Add Withdraw Collateral Feature**
   - Wire up the "Withdraw Available" button
   - Create WithdrawCollateralModal
   - Use `adjustTrove` to remove BTC collateral

---

## Current Transaction Flow

### ✅ Working: Add Collateral (New Trove)
```
User clicks "Add Bitcoin Collateral"
  ↓
Opens AddCollateralModal
  ↓
User enters BTC amount (e.g., 0.5 BTC)
User enters MUSD to borrow (e.g., 20,000 MUSD)
  ↓
Clicks "Open Trove & Borrow"
  ↓
Calls borrowMUSD(20000 MUSD, 0.5 BTC)
  ↓
User signs in wallet (isBorrowing = true)
  ↓
Transaction sent (borrowTxHash available)
  ↓
Waiting for confirmation (isConfirming = true)
  ↓
Confirmed! (isConfirmed = true)
  ↓
Modal closes after 2 seconds
  ↓
Dashboard updates with real data
```

### ❌ Broken: Borrow More MUSD
```
User clicks "Borrow More MUSD"
  ↓
Opens BorrowMUSDModal
  ↓
User enters MUSD amount (e.g., 5,000 MUSD)
  ↓
Clicks "Borrow MUSD"
  ↓
ERROR: borrowMUSD() now requires BTC amount but we don't have one!
```

**Need**: Use `adjustTrove` function instead.

### ❌ Needs Improvement: Repay MUSD
```
User clicks "Repay MUSD"
  ↓
Opens RepayMUSDModal
  ↓
User enters MUSD amount
  ↓
Calls repayMUSD(amount)
  ↓
Shows "Transaction submitted" immediately (wrong!)
Should wait for confirmation like AddCollateralModal
```

---

## Technical Details

### Updated Hook Signature
```typescript
// Before (WRONG - hardcoded BTC)
borrowMUSD(musdAmount: bigint)

// After (CORRECT - accepts BTC amount)
borrowMUSD(musdAmount: bigint, btcCollateral: bigint)
```

### What We Need to Add
```typescript
// In useMezoContracts.ts
const adjustTrove = async (
  btcCollateralChange: bigint, // Can be positive (add) or negative (withdraw)
  musdChange: bigint,          // Can be positive (borrow) or negative (repay)
  isDebtIncrease: boolean      // true if borrowing, false if repaying
) => {
  return borrowWrite({
    address: BORROWER_OPERATIONS_ADDRESS,
    abi: BorrowerOperationsDeployment.abi,
    functionName: 'adjustTrove',
    args: [
      parseUnits('2', 18), // _maxFeePercentage
      btcCollateralChange,
      musdChange,
      isDebtIncrease,
      address, // _upperHint
      address, // _lowerHint
    ],
    value: btcCollateralChange > 0n ? btcCollateralChange : 0n,
  })
}
```

### BorrowerOperations ABI Check Needed
We need to check the actual function signatures in `BorrowerOperationsDeployment.abi` to see:
1. Does `adjustTrove` exist?
2. What are the exact parameters?
3. Can we borrow more without adding collateral?

---

## Summary

**Fixed**:
- ✅ AddCollateralModal properly sends transactions
- ✅ Actual BTC amount is used (not hardcoded 0.1)
- ✅ Transaction confirmation tracking
- ✅ Proper loading states

**Still To Do**:
- ❌ Fix BorrowMUSDModal (needs adjustTrove function)
- ❌ Fix RepayMUSDModal (needs confirmation flow)
- ❌ Add BTC price oracle
- ❌ Wire up Withdraw button

**Known Issues**:
- BTC price is hardcoded at $83,333
- Transaction history is still mock data
- Interest calculations are simplified
