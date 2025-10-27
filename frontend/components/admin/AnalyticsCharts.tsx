'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react'

// Mock data for demonstration (in production, fetch from contract events)
const generateTransactionData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, index) => ({
    month,
    volume: Math.floor(Math.random() * 50000) + 10000 + (index * 5000),
    transactions: Math.floor(Math.random() * 100) + 20 + (index * 10),
    fees: Math.floor((Math.random() * 500) + 100 + (index * 50)),
  }))
}

const generateMerchantData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, index) => ({
    month,
    total: 5 + index * 3,
    verified: 3 + index * 2,
    pending: 2 + index,
  }))
}

const generateRevenueData = () => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
  return weeks.map((week, index) => ({
    week,
    revenue: Math.floor(Math.random() * 2000) + 500 + (index * 300),
    fees: Math.floor(Math.random() * 200) + 50 + (index * 30),
  }))
}

export function AnalyticsCharts() {
  const transactionData = generateTransactionData()
  const merchantData = generateMerchantData()
  const revenueData = generateRevenueData()

  return (
    <div className="space-y-6">
      {/* Transaction Volume Chart */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <TrendingUp className="h-5 w-5 inline mr-2 text-blue-500" />
              Transaction Volume
            </CardTitle>
            <div className="text-sm text-[var(--text-muted)]">Last 6 months</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transactionData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} MUSD`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-sm text-[var(--text-muted)]">Total Volume</p>
              <p className="text-xl font-bold text-blue-500">
                {transactionData.reduce((sum, d) => sum + d.volume, 0).toLocaleString()} MUSD
              </p>
            </div>
            <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-sm text-[var(--text-muted)]">Transactions</p>
              <p className="text-xl font-bold text-green-500">
                {transactionData.reduce((sum, d) => sum + d.transactions, 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-sm text-[var(--text-muted)]">Avg per Month</p>
              <p className="text-xl font-bold text-purple-500">
                {Math.floor(transactionData.reduce((sum, d) => sum + d.volume, 0) / transactionData.length).toLocaleString()} MUSD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Growth Chart */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>
              <Users className="h-5 w-5 inline mr-2 text-green-500" />
              Merchant Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={merchantData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="verified" fill="#10B981" name="Verified" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-green-500">
                {merchantData[merchantData.length - 1].verified}
              </p>
              <p className="text-sm text-[var(--text-muted)]">Active Merchants</p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Revenue Chart */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>
              <DollarSign className="h-5 w-5 inline mr-2 text-orange-500" />
              Platform Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="week" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} MUSD`, '']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="fees"
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Platform Fees"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-orange-500">
                {revenueData.reduce((sum, d) => sum + d.fees, 0).toLocaleString()} MUSD
              </p>
              <p className="text-sm text-[var(--text-muted)]">Total Fees Collected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Types */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>
            <ShoppingCart className="h-5 w-5 inline mr-2 text-purple-500" />
            Payment Methods Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: 'Pay in Full', value: 45, fill: '#10B981' },
                  { name: '4 Payments', value: 30, fill: '#3B82F6' },
                  { name: '6 Payments', value: 15, fill: '#A855F7' },
                  { name: '8 Payments', value: 10, fill: '#F59E0B' },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="name" type="category" stroke="#888" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Usage']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
