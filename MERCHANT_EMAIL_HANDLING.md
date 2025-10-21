# Merchant Email Handling

## Overview

Email is collected during merchant registration but stored **off-chain** for privacy and gas optimization reasons.

## Current Implementation

### Registration Flow

1. **Merchant Registration Form** (`/merchant/register`)
   - Step 1: Business Info includes **Contact Email** field
   - Email validation (format check)
   - Email shown in review step

2. **On-Chain Storage** (Smart Contract)
   - Business name
   - Store URL
   - Category
   - Logo (text + color)
   - Wallet address
   - Stats (sales, volume)

3. **Off-Chain Storage** (Temporary: localStorage)
   - Email address
   - Timestamp
   - Stored as: `merchant_email_{walletAddress}`

## Why Off-Chain?

**Benefits:**
1. **Privacy** - Email not exposed on public blockchain
2. **Gas Savings** - String storage is expensive
3. **Flexibility** - Easy to update without transaction
4. **Compliance** - Easier GDPR/privacy law compliance

**Trade-offs:**
- Requires backend infrastructure
- Not decentralized
- Needs separate database

## Production Implementation (TODO)

### Backend API Needed

```typescript
// POST /api/merchant/register-email
{
  "walletAddress": "0x...",
  "email": "contact@merchant.com",
  "businessName": "Tech Haven"
}
```

### Database Schema

```sql
CREATE TABLE merchant_emails (
  wallet_address VARCHAR(42) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_merchant_email ON merchant_emails(email);
```

### Email Verification Flow

1. **Registration Email**
```
Subject: Welcome to BitBNPL - Verify Your Merchant Account

Hi {businessName},

Thank you for registering with BitBNPL! Your merchant account is being reviewed.

Wallet Address: {walletAddress}
Business Name: {businessName}
Category: {category}

What happens next:
✓ Our team will review your application (24-48 hours)
✓ You'll receive a verification email when approved
✓ Once verified, you can integrate BitBNPL into your store

Questions? Reply to this email.

Best regards,
BitBNPL Team
```

2. **Verification Email**
```
Subject: Your BitBNPL Merchant Account is Verified!

Hi {businessName},

Great news! Your merchant account has been verified.

You can now:
✓ Copy your integration code
✓ Download the SDK
✓ Start accepting BitBNPL payments

Login to your dashboard: https://bitbnpl.com/merchant/dashboard

Get started: https://docs.bitbnpl.com/integration

Best regards,
BitBNPL Team
```

3. **Transaction Notifications** (Optional)
```
Subject: Payment Received - ${amount} MUSD

Hi {businessName},

You received a new payment:

Amount: {amount} MUSD
Your receive: {netAmount} MUSD (after 1% fee)
Customer: {customerWallet}
Transaction: {txHash}

View details: https://bitbnpl.com/merchant/dashboard

Best regards,
BitBNPL Team
```

## Implementation Steps

### Phase 1: Backend Setup

1. **Create API Routes**
   ```
   POST   /api/merchant/register-email
   GET    /api/merchant/email/{walletAddress}
   PUT    /api/merchant/email/{walletAddress}
   DELETE /api/merchant/email/{walletAddress}
   ```

2. **Set Up Database**
   - PostgreSQL or MongoDB
   - Merchant emails table
   - Indexes for performance

3. **Email Service**
   - SendGrid, AWS SES, or Resend
   - Email templates
   - Rate limiting

### Phase 2: Frontend Integration

1. **Update Registration**
   ```typescript
   // After successful on-chain registration
   const response = await fetch('/api/merchant/register-email', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       walletAddress: address,
       email: formData.email,
       businessName: formData.businessName,
     }),
   })

   if (response.ok) {
     // Email saved, verification email sent
     console.log('Verification email sent')
   }
   ```

2. **Dashboard Email Display**
   ```typescript
   // Fetch email from backend
   const { data: emailData } = await fetch(
     `/api/merchant/email/${address}`
   )

   // Show in dashboard
   <div>
     <label>Contact Email</label>
     <p>{emailData.email}</p>
     <Button>Update Email</Button>
   </div>
   ```

### Phase 3: Email Automation

1. **Welcome Email** - On registration
2. **Verification Email** - When admin verifies
3. **Transaction Alerts** - On each payment (optional)
4. **Monthly Reports** - Sales summary (optional)

## Security Considerations

1. **Email Verification**
   - Send verification link before activation
   - Prevent spam/fake emails

2. **Rate Limiting**
   - Limit registration attempts
   - Prevent email bombing

3. **Data Protection**
   - Encrypt emails in database
   - GDPR compliance (right to delete)
   - Privacy policy

4. **Authentication**
   - Verify wallet signature before email updates
   - Prevent unauthorized access

## Alternative Approaches

### Option 1: IPFS Storage
```typescript
// Store email metadata on IPFS
const metadata = {
  email: formData.email,
  businessName: formData.businessName,
  timestamp: Date.now()
}

const ipfsHash = await uploadToIPFS(metadata)

// Store only hash on-chain
await contract.setMerchantMetadata(address, ipfsHash)
```

**Pros:** Decentralized, censorship-resistant
**Cons:** Email still public via IPFS, can't send emails

### Option 2: Encrypted On-Chain
```solidity
// Store encrypted email on-chain
function setEncryptedEmail(bytes memory encryptedEmail) external {
  merchants[msg.sender].encryptedEmail = encryptedEmail;
}
```

**Pros:** On-chain but private
**Cons:** Expensive gas, decryption complexity

### Option 3: Off-Chain (Recommended)
**Pros:** Private, flexible, cheap
**Cons:** Centralized, needs infrastructure

## Current Status

**Implemented:**
- ✅ Email field in registration form
- ✅ Email validation
- ✅ Temporary localStorage storage
- ✅ Email shown in review step

**TODO:**
- ⏳ Backend API for email storage
- ⏳ Database setup
- ⏳ Email service integration
- ⏳ Verification emails
- ⏳ Transaction notification emails
- ⏳ Email update functionality

## Testing

```bash
# Test email validation
email: "test@example.com" ✓
email: "invalid-email" ✗
email: "" ✗

# Test localStorage storage
localStorage.getItem('merchant_email_0x...')
# Returns: { email, businessName, timestamp }

# Test backend API (when implemented)
curl -X POST https://api.bitbnpl.com/merchant/register-email \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "email": "test@example.com",
    "businessName": "Test Store"
  }'
```

## Notes

- Email is **not required** for smart contract registration
- Smart contract will work without email
- Email only needed for platform notifications
- Merchants can update email anytime
- Platform can still function without email backend

---

**Priority:** Medium (nice-to-have for production, not blocking)
**Estimated Time:** 1-2 days for full backend integration
**Dependencies:** Backend infrastructure, email service
