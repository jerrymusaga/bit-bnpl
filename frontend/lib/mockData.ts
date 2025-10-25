// Mock data for development and demo purposes

export interface Transaction {
  id: string
  type: 'borrow' | 'repayment' | 'purchase'
  amount: number
  merchant?: string
  product?: string
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
  txHash?: string
}

export interface UserCollateral {
  btcAmount: number
  usdValue: number
  borrowingCapacity: number
  musdBorrowed: number // MUSD borrowed
  musdAvailable: number // Available MUSD to borrow
  collateralRatio: number
  healthFactor: number
}

export interface LoanPosition {
  id: string
  musdPrincipal: number // Principal in MUSD
  musdInterest: number // Interest in MUSD
  interestRate: number
  musdTotalOwed: number // Total owed in MUSD
  createdAt: Date
  lastUpdated: Date
}

// Mock user collateral data
export const mockUserCollateral: UserCollateral = {
  btcAmount: 0.15,
  usdValue: 12500,
  borrowingCapacity: 11250, // 90% LTV
  musdBorrowed: 3500, // MUSD borrowed
  musdAvailable: 7750, // Available MUSD
  collateralRatio: 357, // (12500 / 3500) * 100
  healthFactor: 3.24, // 12500 / (3500 * 1.1)
}

// Mock loan position
export const mockLoanPosition: LoanPosition = {
  id: '0x1234...5678',
  musdPrincipal: 3500, // MUSD principal
  musdInterest: 35, // 1% of 3500 MUSD
  interestRate: 1,
  musdTotalOwed: 3535, // Total MUSD owed
  createdAt: new Date('2025-09-15'),
  lastUpdated: new Date(),
}

// Mock transaction history
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'purchase',
    amount: 1200,
    merchant: 'TechStore',
    product: 'MacBook Pro 14"',
    timestamp: new Date('2025-10-10T14:30:00'),
    status: 'completed',
    txHash: '0xabcd...1234',
  },
  {
    id: '2',
    type: 'purchase',
    amount: 850,
    merchant: 'GameHub',
    product: 'PlayStation 5',
    timestamp: new Date('2025-10-08T09:15:00'),
    status: 'completed',
    txHash: '0xabcd...5678',
  },
  {
    id: '3',
    type: 'borrow',
    amount: 1500,
    timestamp: new Date('2025-10-05T16:45:00'),
    status: 'completed',
    txHash: '0xabcd...9012',
  },
  {
    id: '4',
    type: 'purchase',
    amount: 450,
    merchant: 'FashionStore',
    product: 'Designer Jacket',
    timestamp: new Date('2025-10-01T11:20:00'),
    status: 'completed',
    txHash: '0xabcd...3456',
  },
  {
    id: '5',
    type: 'repayment',
    amount: 500,
    timestamp: new Date('2025-09-28T13:30:00'),
    status: 'completed',
    txHash: '0xabcd...7890',
  },
]

// Mock merchant data
export interface MerchantStats {
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  conversionRate: number
}

export const mockMerchantStats: MerchantStats = {
  totalRevenue: 45280,
  totalTransactions: 127,
  averageOrderValue: 356.54,
  conversionRate: 12.4,
}

export interface MerchantTransaction {
  id: string
  buyer: string
  amount: number
  product: string
  timestamp: Date
  status: 'completed' | 'pending' | 'refunded'
  fee: number
}

export const mockMerchantTransactions: MerchantTransaction[] = [
  {
    id: '1',
    buyer: '0x1234...5678',
    amount: 1200,
    product: 'MacBook Pro 14"',
    timestamp: new Date('2025-10-15T10:30:00'),
    status: 'completed',
    fee: 30,
  },
  {
    id: '2',
    buyer: '0xabcd...ef01',
    amount: 850,
    product: 'iPhone 15 Pro',
    timestamp: new Date('2025-10-14T15:45:00'),
    status: 'completed',
    fee: 21.25,
  },
  {
    id: '3',
    buyer: '0x9876...5432',
    amount: 450,
    product: 'AirPods Pro',
    timestamp: new Date('2025-10-14T09:20:00'),
    status: 'pending',
    fee: 11.25,
  },
  {
    id: '4',
    buyer: '0xdef0...1234',
    amount: 2100,
    product: 'Gaming Laptop',
    timestamp: new Date('2025-10-13T14:15:00'),
    status: 'completed',
    fee: 52.5,
  },
]

// Demo store products
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: 'laptop' | 'phone' | 'tablet' | 'accessories'
  image: string
  inStock: boolean
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    description: 'M3 Pro chip, 18GB RAM, 512GB SSD. Perfect for professional work.',
    price: 100,
    category: 'laptop',
    image: '/products/macbook.jpg',
    inStock: true,
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'A17 Pro chip, 256GB storage, Titanium design.',
    price: 999,
    category: 'phone',
    image: '/products/iphone.jpg',
    inStock: true,
  },
  {
    id: '3',
    name: 'iPad Air',
    description: 'M2 chip, 128GB storage, 11-inch Liquid Retina display.',
    price: 599,
    category: 'tablet',
    image: '/products/ipad.jpg',
    inStock: true,
  },
  {
    id: '4',
    name: 'Dell XPS 15',
    description: 'Intel i7, 16GB RAM, 1TB SSD, 4K OLED display.',
    price: 1799,
    category: 'laptop',
    image: '/products/dell-xps.jpg',
    inStock: true,
  },
  {
    id: '5',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Snapdragon 8 Gen 3, 512GB storage, S Pen included.',
    price: 1199,
    category: 'phone',
    image: '/products/galaxy.jpg',
    inStock: true,
  },
  {
    id: '6',
    name: 'AirPods Pro',
    description: 'Active Noise Cancellation, Spatial Audio, USB-C charging.',
    price: 249,
    category: 'accessories',
    image: '/products/airpods.jpg',
    inStock: true,
  },
  {
    id: '7',
    name: 'Surface Laptop 5',
    description: 'Intel i5, 8GB RAM, 256GB SSD, 13.5" PixelSense display.',
    price: 999,
    category: 'laptop',
    image: '/products/surface.jpg',
    inStock: true,
  },
  {
    id: '8',
    name: 'Sony WH-1000XM5',
    description: 'Premium noise canceling headphones with 30-hour battery.',
    price: 399,
    category: 'accessories',
    image: '/products/sony-headphones.jpg',
    inStock: false,
  },
]

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format MUSD (Mezo USD stablecoin)
export const formatMUSD = (amount: number): string => {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUSD`
}

// Format BTC
export const formatBTC = (amount: number): string => {
  return `${amount.toFixed(8)} BTC`
}

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
