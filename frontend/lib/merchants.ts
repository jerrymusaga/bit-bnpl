export interface Merchant {
  id: string
  name: string
  description: string
  logoText: string // Initials for logo (e.g., "TH" for Tech Haven)
  logoColor: string // Background color for logo
  walletAddress: string // Where merchant receives MUSD instantly
  storeUrl: string // External URL to merchant's actual store
  category: string
  isVerified: boolean
  totalSales: number
  rating: number
  integrationDate: string
  features: string[] // What they sell (e.g., "Electronics", "Laptops", "Phones")
}

// Mock merchants data for MVP (will be replaced with API later)
// These are external stores that have integrated BitBNPL payment
export const MOCK_MERCHANTS: Merchant[] = [
  {
    id: 'tech-haven',
    name: 'Tech Haven',
    description: 'Premium electronics and gadgets store accepting BitBNPL payments',
    logoText: 'TH',
    logoColor: '#3B82F6', // blue
    walletAddress: '0x1234567890123456789012345678901234567890',
    storeUrl: 'https://techhaven.example.com',
    category: 'Electronics',
    isVerified: true,
    totalSales: 1250,
    rating: 4.8,
    integrationDate: '2024-01-15',
    features: ['Smartphones', 'Laptops', 'Tablets', 'Audio Devices', 'Smart Home'],
  },
  {
    id: 'fashion-forward',
    name: 'Fashion Forward',
    description: 'Trendy clothing and accessories boutique with BitBNPL checkout',
    logoText: 'FF',
    logoColor: '#EC4899', // pink
    walletAddress: '0x2234567890123456789012345678901234567890',
    storeUrl: 'https://fashionforward.example.com',
    category: 'Fashion',
    isVerified: true,
    totalSales: 890,
    rating: 4.6,
    integrationDate: '2024-02-20',
    features: ['Designer Clothing', 'Footwear', 'Accessories', 'Jewelry'],
  },
  {
    id: 'home-essentials',
    name: 'Home Essentials',
    description: 'Modern furniture and home decor marketplace',
    logoText: 'HE',
    logoColor: '#10B981', // green
    walletAddress: '0x3234567890123456789012345678901234567890',
    storeUrl: 'https://homeessentials.example.com',
    category: 'Home & Living',
    isVerified: true,
    totalSales: 650,
    rating: 4.7,
    integrationDate: '2024-03-10',
    features: ['Furniture', 'Lighting', 'Decor', 'Kitchen', 'Outdoor'],
  },
  {
    id: 'sports-gear',
    name: 'Sports Gear Pro',
    description: 'Athletic equipment and sportswear superstore',
    logoText: 'SG',
    logoColor: '#F59E0B', // amber
    walletAddress: '0x4234567890123456789012345678901234567890',
    storeUrl: 'https://sportsgear.example.com',
    category: 'Sports',
    isVerified: true,
    totalSales: 540,
    rating: 4.5,
    integrationDate: '2024-03-25',
    features: ['Running', 'Gym Equipment', 'Yoga', 'Team Sports', 'Outdoor Gear'],
  },
  {
    id: 'gamer-haven',
    name: 'Gamer Haven',
    description: 'Gaming gear, consoles, and accessories with instant BitBNPL approval',
    logoText: 'GH',
    logoColor: '#8B5CF6', // purple
    walletAddress: '0x5234567890123456789012345678901234567890',
    storeUrl: 'https://gamerhaven.example.com',
    category: 'Gaming',
    isVerified: true,
    totalSales: 980,
    rating: 4.9,
    integrationDate: '2024-01-30',
    features: ['Gaming PCs', 'Consoles', 'Peripherals', 'Games', 'Streaming Gear'],
  },
  {
    id: 'beauty-boutique',
    name: 'Beauty Boutique',
    description: 'Premium skincare and cosmetics with flexible payment options',
    logoText: 'BB',
    logoColor: '#EF4444', // red
    walletAddress: '0x6234567890123456789012345678901234567890',
    storeUrl: 'https://beautyboutique.example.com',
    category: 'Beauty',
    isVerified: true,
    totalSales: 720,
    rating: 4.7,
    integrationDate: '2024-02-15',
    features: ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Beauty Tools'],
  },
]

// Helper functions
export function getAllMerchants(): Merchant[] {
  return MOCK_MERCHANTS
}

export function getMerchantById(id: string): Merchant | undefined {
  return MOCK_MERCHANTS.find((m) => m.id === id)
}

export function getMerchantsByCategory(category: string): Merchant[] {
  if (category === 'all') return MOCK_MERCHANTS
  return MOCK_MERCHANTS.filter((m) => m.category === category)
}

export function searchMerchants(query: string): Merchant[] {
  const lowercaseQuery = query.toLowerCase()
  return MOCK_MERCHANTS.filter(
    (m) =>
      m.name.toLowerCase().includes(lowercaseQuery) ||
      m.description.toLowerCase().includes(lowercaseQuery) ||
      m.category.toLowerCase().includes(lowercaseQuery)
  )
}

export const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Sports',
  'Gaming',
  'Beauty',
  'Books',
  'Food & Beverage',
]
