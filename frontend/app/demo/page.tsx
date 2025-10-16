'use client'

import { useState } from 'react'
import { Card, Button, Badge } from '@/components/ui'
import { mockProducts, formatCurrency, type Product } from '@/lib/mockData'
import { ShoppingCart, Package } from 'lucide-react'
import Link from 'next/link'

export default function DemoStorePage() {
  const [cart, setCart] = useState<Product[]>([])
  const products = mockProducts

  const addToCart = (product: Product) => {
    setCart([...cart, product])
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0)
  const cartCount = cart.length

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mock Data Banner */}
        <Card padding="md" className="mb-6 bg-[var(--color-warning-500)]/10 border-[var(--color-warning-500)]/20">
          <p className="text-sm text-center text-[var(--text-primary)]">
            <span className="font-semibold">Demo Store - Mock Data:</span> This is a demonstration with sample products. All data is for testing purposes only.
          </p>
        </Card>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Demo Store</h1>
            <p className="text-[var(--text-secondary)]">
              Shop with BitBNPL and pay with MUSD in installments
            </p>
          </div>
          <Link href="/checkout">
            <Button variant="accent" size="lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Checkout ({cartCount})
              {cartCount > 0 && ` - ${formatCurrency(cartTotal)}`}
            </Button>
          </Link>
        </div>

        {/* Cart Summary Banner */}
        {cartCount > 0 && (
          <Card padding="md" className="mb-6 bg-[var(--color-accent-600)]/10 border-[var(--color-accent-600)]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-5 w-5 text-[var(--color-accent-600)]" />
                <span className="text-[var(--text-primary)]">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-[var(--text-primary)]">
                  Total: {formatCurrency(cartTotal)}
                </span>
                <Link href="/checkout">
                  <Button variant="accent" size="sm">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} padding="none" hoverable>
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-[var(--bg-secondary)] flex items-center justify-center rounded-t-xl">
                <Package className="h-20 w-20 text-[var(--text-muted)]" />
              </div>

              <div className="p-4">
                {/* Category Badge */}
                <Badge variant="neutral" size="sm" className="mb-2">
                  {product.category}
                </Badge>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(product.price)}
                  </span>
                  {product.inStock ? (
                    <Badge variant="success" size="sm">In Stock</Badge>
                  ) : (
                    <Badge variant="error" size="sm">Out of Stock</Badge>
                  )}
                </div>

                {/* Interest Calculation */}
                <div className="bg-[var(--bg-secondary)] p-3 rounded-lg mb-4">
                  <p className="text-xs text-[var(--text-muted)] mb-1">
                    With BitBNPL @ 1% APR:
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-accent-600)]">
                    Only {formatCurrency(product.price * 0.01)} interest/year
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    vs {formatCurrency(product.price * 0.20)} with traditional BNPL
                  </p>
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="accent"
                  fullWidth
                  disabled={!product.inStock}
                  onClick={() => addToCart(product)}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card padding="lg" className="mt-12 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">How Demo Checkout Works</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            This is a demonstration store. When you proceed to checkout, you&apos;ll see how BitBNPL integrates into a real e-commerce experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-3xl font-bold text-[var(--color-accent-600)] mb-2">1%</div>
              <p className="text-sm text-[var(--text-secondary)]">
                Annual interest rate on all purchases
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-accent-600)] mb-2">0</div>
              <p className="text-sm text-[var(--text-secondary)]">
                Credit checks or income verification
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-accent-600)] mb-2">100%</div>
              <p className="text-sm text-[var(--text-secondary)]">
                Your Bitcoin stays yours
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
