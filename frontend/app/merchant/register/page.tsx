'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Card, Button, Badge } from '@/components/ui'
import { useMerchantRegistry } from '@/hooks/useMerchantRegistry'
import {
  Store,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Palette,
  Mail,
} from 'lucide-react'

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Gaming',
  'Home & Garden',
  'Sports',
  'Books',
  'Food & Beverage',
  'Health & Beauty',
  'Toys & Kids',
  'Other',
]

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]

export default function MerchantRegisterPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { register, isRegistering, isRegistered, merchantData } = useMerchantRegistry()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    storeUrl: '',
    category: '',
    logoText: '',
    logoColor: PRESET_COLORS[0],
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect after successful registration
  if (isRegistered && !isRegistering) {
    router.push('/merchant/dashboard')
    return null
  }

  // Check if already registered (skip during registration to avoid redirect loop)
  if (merchantData?.isActive && !isRegistering) {
    router.push('/merchant/dashboard')
    return null
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (!formData.category) {
        newErrors.category = 'Please select a category'
      }
    }

    if (currentStep === 2) {
      if (!formData.storeUrl.trim()) {
        newErrors.storeUrl = 'Store URL is required'
      } else if (!formData.storeUrl.startsWith('http')) {
        newErrors.storeUrl = 'URL must start with http:// or https://'
      }
    }

    if (currentStep === 3) {
      if (!formData.logoText.trim()) {
        newErrors.logoText = 'Logo text is required'
      } else if (formData.logoText.length > 3) {
        newErrors.logoText = 'Logo text should be 1-3 characters'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!address || !validateStep(step)) return

    try {
      // Register merchant on-chain
      await register({
        walletAddress: address,
        businessName: formData.businessName,
        storeUrl: formData.storeUrl,
        category: formData.category.toLowerCase(),
        logoText: formData.logoText.toUpperCase(),
        logoColor: formData.logoColor,
      })

      // TODO: Send email to backend API for off-chain storage
      // This will allow platform to send verification emails
      // Example:
      // await fetch('/api/merchant/register-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     walletAddress: address,
      //     email: formData.email,
      //     businessName: formData.businessName,
      //   }),
      // })

      // For now, store in localStorage as temporary solution
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `merchant_email_${address}`,
          JSON.stringify({
            email: formData.email,
            businessName: formData.businessName,
            timestamp: Date.now(),
          })
        )
      }
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center mx-auto mb-6">
              <Store className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              Please connect your wallet to register as a merchant on BitBNPL
            </p>
            <Button variant="accent" size="lg" onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (isRegistered) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card padding="lg" className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Registration Successful!</h1>
              <p className="text-lg text-[var(--text-secondary)] mb-6">
                Your merchant account has been created. Our team will verify your account within 24-48 hours.
              </p>
              <div className="bg-[var(--bg-secondary)] p-6 rounded-xl mb-6">
                <h3 className="font-semibold mb-4">What happens next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Account Review</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        We will verify your business information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Email Notification</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        You will receive an email when verified
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Start Accepting Payments</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Get your integration code and go live
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="accent" size="lg" onClick={() => router.push('/merchant/dashboard')}>
                Go to Dashboard
              </Button>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-primary-600)] bg-clip-text text-transparent">
              Become a Merchant
            </h1>
          </div>
          <p className="text-center text-lg text-[var(--text-secondary)]">
            Join BitBNPL and get paid instantly while your customers pay in installments
          </p>
        </div>

        {/* Benefits Banner */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Instant Settlement</p>
                <p className="text-xs text-[var(--text-muted)]">Get paid in seconds</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Zero Chargebacks</p>
                <p className="text-xs text-[var(--text-muted)]">No reversal risk</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Only 1% Fee</p>
                <p className="text-xs text-[var(--text-muted)]">vs 3-6% others</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      s <= step
                        ? 'bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] text-white shadow-lg'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                    }`}
                  >
                    {s < step ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className="text-xs mt-2 font-medium hidden sm:block">
                    {s === 1 && 'Business'}
                    {s === 2 && 'Store'}
                    {s === 3 && 'Branding'}
                    {s === 4 && 'Review'}
                  </span>
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all ${
                      s < step ? 'bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)]' : 'bg-[var(--bg-secondary)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="max-w-2xl mx-auto">
          <Card padding="lg">
            {/* Step 1: Business Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Business Information</h2>
                  <p className="text-[var(--text-secondary)]">
                    Tell us about your business
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Tech Haven"
                    className={`w-full px-4 py-3 bg-[var(--bg-card)] border-2 ${
                      errors.businessName ? 'border-red-500' : 'border-[var(--border-color)]'
                    } rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)]/50 focus:border-[var(--color-accent-600)] transition-all`}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@techhaven.com"
                    className={`w-full px-4 py-3 bg-[var(--bg-card)] border-2 ${
                      errors.email ? 'border-red-500' : 'border-[var(--border-color)]'
                    } rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)]/50 focus:border-[var(--color-accent-600)] transition-all`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    We will send verification updates and important notifications to this email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Business Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          formData.category === cat
                            ? 'bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] text-white border-transparent shadow-lg'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--color-accent-600)]/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-2">{errors.category}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Store URL */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Store Information</h2>
                  <p className="text-[var(--text-secondary)]">
                    Where can customers find your store?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Store URL *
                  </label>
                  <input
                    type="url"
                    value={formData.storeUrl}
                    onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
                    placeholder="https://yourstore.com"
                    className={`w-full px-4 py-3 bg-[var(--bg-card)] border-2 ${
                      errors.storeUrl ? 'border-red-500' : 'border-[var(--border-color)]'
                    } rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)]/50 focus:border-[var(--color-accent-600)] transition-all`}
                  />
                  {errors.storeUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.storeUrl}</p>
                  )}
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    This is where users will be redirected to shop
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your business..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)]/50 focus:border-[var(--color-accent-600)] transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Branding */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Branding</h2>
                  <p className="text-[var(--text-secondary)]">
                    Customize how your store appears on BitBNPL
                  </p>
                </div>

                {/* Logo Preview */}
                <div className="flex justify-center mb-6">
                  <div
                    className="w-32 h-32 rounded-2xl shadow-2xl flex items-center justify-center"
                    style={{ backgroundColor: formData.logoColor }}
                  >
                    <span className="text-white text-5xl font-bold">
                      {formData.logoText || '?'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    <Palette className="h-4 w-4 inline mr-2" />
                    Logo Text (1-3 characters) *
                  </label>
                  <input
                    type="text"
                    value={formData.logoText}
                    onChange={(e) => setFormData({ ...formData, logoText: e.target.value.slice(0, 3) })}
                    placeholder="TH"
                    maxLength={3}
                    className={`w-full px-4 py-3 bg-[var(--bg-card)] border-2 ${
                      errors.logoText ? 'border-red-500' : 'border-[var(--border-color)]'
                    } rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)]/50 focus:border-[var(--color-accent-600)] transition-all uppercase`}
                  />
                  {errors.logoText && (
                    <p className="text-sm text-red-500 mt-1">{errors.logoText}</p>
                  )}
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    Usually your business initials (e.g., &quot;TH&quot; for Tech Haven)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                    Logo Color
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoColor: color })}
                        className={`w-full h-16 rounded-xl transition-all ${
                          formData.logoColor === color
                            ? 'ring-4 ring-[var(--color-accent-600)] scale-110 shadow-xl'
                            : 'hover:scale-105 shadow-md'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
                  <p className="text-[var(--text-secondary)]">
                    Please review your information before submitting
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-6 rounded-xl space-y-4">
                  {/* Logo Preview */}
                  <div className="flex items-center space-x-4 pb-4 border-b border-[var(--border-color)]">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: formData.logoColor }}
                    >
                      <span className="text-white text-2xl font-bold">{formData.logoText}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">
                        {formData.businessName}
                      </h3>
                      <Badge variant="default" size="sm">
                        {formData.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-start py-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Contact Email</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {formData.email}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Store URL</span>
                      <a
                        href={formData.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--color-accent-600)] hover:underline font-medium"
                      >
                        {formData.storeUrl}
                      </a>
                    </div>

                    <div className="flex justify-between items-start py-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Wallet Address</span>
                      <span className="text-sm font-mono text-[var(--text-primary)]">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Platform Fee</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">1%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                        What happens after registration?
                      </p>
                      <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                        <li>• Your account will be reviewed within 24-48 hours</li>
                        <li>• You will receive verification status via email</li>
                        <li>• Once verified, you can integrate BitBNPL into your store</li>
                        <li>• Start receiving instant MUSD payments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isRegistering}
                className={step === 1 ? 'invisible' : ''}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {step < 4 ? (
                <Button variant="accent" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={handleSubmit}
                  disabled={isRegistering}
                  className="min-w-[140px]"
                >
                  {isRegistering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
