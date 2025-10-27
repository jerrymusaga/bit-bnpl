import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * MoonPay Webhook Handler
 *
 * Handles webhook events from MoonPay for transaction status updates
 * Endpoint: POST /api/webhooks/moonpay
 */

const MOONPAY_SECRET_KEY = process.env.MOONPAY_SECRET_KEY || ''

/**
 * Verify MoonPay webhook signature
 */
function verifySignature(signature: string, body: string): boolean {
  if (!MOONPAY_SECRET_KEY) {
    console.warn('[MoonPay Webhook] Secret key not configured')
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', MOONPAY_SECRET_KEY)
      .update(body)
      .digest('base64')

    return signature === expectedSignature
  } catch (error) {
    console.error('[MoonPay Webhook] Signature verification failed:', error)
    return false
  }
}

/**
 * Handle MoonPay webhook POST request
 */
export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get('moonpay-signature') || ''

    // Get raw body
    const body = await request.text()

    // Verify signature
    if (!verifySignature(signature, body)) {
      console.error('[MoonPay Webhook] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook data
    const data = JSON.parse(body)
    const { type, data: eventData } = data

    console.log(`[MoonPay Webhook] Received event: ${type}`, eventData)

    // Handle different event types
    switch (type) {
      case 'transaction_created':
        await handleTransactionCreated(eventData)
        break

      case 'transaction_updated':
        await handleTransactionUpdated(eventData)
        break

      case 'transaction_completed':
        await handleTransactionCompleted(eventData)
        break

      case 'transaction_failed':
        await handleTransactionFailed(eventData)
        break

      default:
        console.log(`[MoonPay Webhook] Unknown event type: ${type}`)
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[MoonPay Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Event Handlers
 */

async function handleTransactionCreated(data: any) {
  console.log('[MoonPay] Transaction created:', {
    id: data.id,
    status: data.status,
    currency: data.currency,
    baseCurrency: data.baseCurrency,
    walletAddress: data.walletAddress,
  })

  // TODO: Store transaction in database
  // - Save transaction ID
  // - Link to user wallet address
  // - Set initial status
}

async function handleTransactionUpdated(data: any) {
  console.log('[MoonPay] Transaction updated:', {
    id: data.id,
    status: data.status,
    failureReason: data.failureReason,
  })

  // TODO: Update transaction status in database
  // - Update transaction record
  // - Send notification to user if needed
}

async function handleTransactionCompleted(data: any) {
  console.log('[MoonPay] Transaction completed:', {
    id: data.id,
    status: data.status,
    cryptoAmount: data.cryptoAmount,
    baseCurrencyAmount: data.baseCurrencyAmount,
    walletAddress: data.walletAddress,
  })

  // TODO: Process successful transaction
  // - Mark transaction as completed in database
  // - Send success notification to user
  // - Trigger any post-purchase logic
  // - Update user's available balance/capacity
}

async function handleTransactionFailed(data: any) {
  console.log('[MoonPay] Transaction failed:', {
    id: data.id,
    status: data.status,
    failureReason: data.failureReason,
  })

  // TODO: Handle failed transaction
  // - Mark transaction as failed in database
  // - Send failure notification to user
  // - Log failure reason for support
}

/**
 * GET handler - return info about the webhook
 */
export async function GET() {
  return NextResponse.json({
    name: 'MoonPay Webhook',
    status: 'active',
    events: [
      'transaction_created',
      'transaction_updated',
      'transaction_completed',
      'transaction_failed',
    ],
  })
}
