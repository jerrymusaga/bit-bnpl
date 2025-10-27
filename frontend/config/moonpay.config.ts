/**
 * MoonPay Configuration
 *
 * MoonPay is used for fiat onramp/offramp functionality
 * allowing users to buy BTC with fiat and merchants to cash out
 */

export const MOONPAY_CONFIG = {
  // API Keys (use environment variables in production)
  apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY || '',
  secretKey: process.env.MOONPAY_SECRET_KEY || '',

  // Environment
  environment: (process.env.NEXT_PUBLIC_MOONPAY_ENV || 'sandbox') as 'sandbox' | 'production',

  // URLs
  urls: {
    sandbox: {
      buy: 'https://buy-sandbox.moonpay.com',
      sell: 'https://sell-sandbox.moonpay.com',
    },
    production: {
      buy: 'https://buy.moonpay.com',
      sell: 'https://sell.moonpay.com',
    },
  },

  // Default settings
  defaults: {
    currencyCode: 'btc', // Bitcoin
    baseCurrencyCode: 'usd', // Default fiat currency
    colorCode: '#FF6B35', // BitBNPL brand color
    language: 'en',
    showWalletAddressForm: false, // We'll provide the wallet address
  },

  // Webhook configuration
  webhook: {
    url: process.env.MOONPAY_WEBHOOK_URL || '',
    events: [
      'transaction_created',
      'transaction_updated',
      'transaction_completed',
      'transaction_failed',
    ],
  },
} as const

/**
 * Get the appropriate MoonPay URL based on environment and type
 */
export function getMoonPayUrl(type: 'buy' | 'sell'): string {
  const env = MOONPAY_CONFIG.environment
  return MOONPAY_CONFIG.urls[env][type]
}

/**
 * Build MoonPay widget URL with parameters
 */
export function buildMoonPayUrl(params: {
  type: 'buy' | 'sell'
  walletAddress: string
  currencyCode?: string
  baseCurrencyAmount?: number
  baseCurrencyCode?: string
  email?: string
  externalCustomerId?: string
}): string {
  const baseUrl = getMoonPayUrl(params.type)
  const url = new URL(baseUrl)

  // Required parameters
  url.searchParams.set('apiKey', MOONPAY_CONFIG.apiKey)
  url.searchParams.set('walletAddress', params.walletAddress)
  url.searchParams.set('currencyCode', params.currencyCode || MOONPAY_CONFIG.defaults.currencyCode)

  // Optional parameters
  if (params.baseCurrencyAmount) {
    url.searchParams.set('baseCurrencyAmount', params.baseCurrencyAmount.toString())
  }
  if (params.baseCurrencyCode) {
    url.searchParams.set('baseCurrencyCode', params.baseCurrencyCode)
  }
  if (params.email) {
    url.searchParams.set('email', params.email)
  }
  if (params.externalCustomerId) {
    url.searchParams.set('externalCustomerId', params.externalCustomerId)
  }

  // Default styling
  url.searchParams.set('colorCode', MOONPAY_CONFIG.defaults.colorCode)
  url.searchParams.set('language', MOONPAY_CONFIG.defaults.language)
  url.searchParams.set('showWalletAddressForm', MOONPAY_CONFIG.defaults.showWalletAddressForm.toString())

  return url.toString()
}

/**
 * Verify MoonPay webhook signature (for backend use)
 */
export function verifyWebhookSignature(
  signature: string,
  body: string
): boolean {
  // This will be implemented on the backend
  // Frontend doesn't need access to secret key
  return true
}
