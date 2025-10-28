# @bitbnpl/react

React SDK for BitBNPL - Bitcoin-backed Buy Now Pay Later

## Installation

```bash
npm install @bitbnpl/react
# or
yarn add @bitbnpl/react
# or
pnpm add @bitbnpl/react
```

## Quick Start

```tsx
import { BitBNPLButton } from '@bitbnpl/react'

function ProductPage() {
  return (
    <div>
      <h1>Premium Headphones - $299.99</h1>

      <BitBNPLButton
        merchantAddress="0xYourMerchantAddress"
        amount={299.99}
        itemName="Premium Headphones"
        itemId="prod_headphones_001"
        itemImage="🎧"
        merchantName="Your Store"
      />
    </div>
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `merchantAddress` | `string` | ✅ | Your verified merchant address on BitBNPL |
| `amount` | `number \| string` | ✅ | Product price in MUSD |
| `itemName` | `string` | ✅ | Product name |
| `itemId` | `string` | ❌ | Unique product identifier |
| `itemImage` | `string` | ❌ | Product emoji/icon (default: 🛍️) |
| `merchantName` | `string` | ❌ | Your store name |
| `children` | `ReactNode` | ❌ | Custom button text (default: "Pay with BitBNPL") |
| `style` | `CSSProperties` | ❌ | Custom inline styles |
| `className` | `string` | ❌ | Custom CSS class |
| `baseUrl` | `string` | ❌ | BitBNPL base URL (default: https://bitbnpl.vercel.app) |
| `onRedirect` | `() => void` | ❌ | Callback when redirect starts |
| `onError` | `(error: Error) => void` | ❌ | Error callback |
| `disabled` | `boolean` | ❌ | Disable the button |

## Examples

### Basic Usage

```tsx
<BitBNPLButton
  merchantAddress="0x1234..."
  amount={99.99}
  itemName="T-Shirt"
/>
```

### Custom Styling

```tsx
<BitBNPLButton
  merchantAddress="0x1234..."
  amount={199.99}
  itemName="Sneakers"
  style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '16px 32px',
  }}
>
  Buy Now - Pay Later
</BitBNPLButton>
```

### With Callbacks

```tsx
<BitBNPLButton
  merchantAddress="0x1234..."
  amount={499.99}
  itemName="Gaming Console"
  onRedirect={() => {
    console.log('User is being redirected to checkout')
    // Track analytics, show loading, etc.
  }}
  onError={(error) => {
    console.error('Checkout error:', error)
    alert('Failed to initiate checkout')
  }}
/>
```

### Dynamic Amount

```tsx
function ProductCard({ product }) {
  return (
    <div>
      <h2>{product.name}</h2>
      <p>${product.price}</p>

      <BitBNPLButton
        merchantAddress="0x1234..."
        amount={product.price}
        itemName={product.name}
        itemId={product.id}
        itemImage={product.emoji}
      />
    </div>
  )
}
```

## TypeScript

This package includes TypeScript definitions. Import types like this:

```tsx
import { BitBNPLButton, BitBNPLButtonProps } from '@bitbnpl/react'

const MyButton: React.FC<BitBNPLButtonProps> = (props) => {
  return <BitBNPLButton {...props} />
}
```

## How It Works

1. **Button Click**: User clicks the BitBNPL payment button
2. **Data Storage**: Product details are stored in `sessionStorage`
3. **Redirect**: User is redirected to BitBNPL checkout page
4. **Checkout**: User connects wallet and completes purchase with installment options

## Requirements

- React 18.0.0 or higher
- Merchant must be verified on BitBNPL platform

## Getting Verified

To use BitBNPL as a merchant:

1. Visit [https://bitbnpl.vercel.app/merchant/register](https://bitbnpl.vercel.app/merchant/register)
2. Register your business
3. Wait for verification (24-48 hours)
4. Use your merchant address in the SDK

## Support

- Live App: [https://bitbnpl.vercel.app](https://bitbnpl.vercel.app)
- Issues: [https://github.com/bitbnpl/react-sdk/issues](https://github.com/bitbnpl/react-sdk/issues)

## License

MIT © BitBNPL
