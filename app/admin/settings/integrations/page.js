'use client'

import {
  CreditCard,
  Truck,
  Store,
  Settings,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export default function IntegrationsPage() {
  const integrations = [
    {
      category: 'Payment Gateways',
      icon: CreditCard,
      items: [
        { name: 'KNET', description: 'Kuwait payment network', status: 'available', connected: false },
        { name: 'Tap Payments', description: 'Card payments & Apple Pay', status: 'available', connected: false },
        { name: 'MyFatoorah', description: 'Multi-currency payments', status: 'available', connected: false },
      ]
    },
    {
      category: 'Delivery Providers',
      icon: Truck,
      items: [
        { name: 'Own Fleet', description: 'Manage your own drivers', status: 'available', connected: true },
        { name: 'Carriage', description: 'Third-party delivery', status: 'coming_soon', connected: false },
        { name: 'Aramex', description: 'Courier delivery', status: 'coming_soon', connected: false },
      ]
    },
    {
      category: 'Aggregators',
      icon: Store,
      items: [
        { name: 'Talabat', description: 'Food delivery aggregator', status: 'available', connected: false },
        { name: 'Deliveroo', description: 'Food delivery aggregator', status: 'available', connected: false },
        { name: 'Careem NOW', description: 'Food delivery aggregator', status: 'coming_soon', connected: false },
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Integrations</h1>
        <p className="text-gray-500 text-sm">Connect third-party services and platforms</p>
      </div>

      {/* Integration Categories */}
      <div className="space-y-6">
        {integrations.map((category) => (
          <Card key={category.category} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#a8c5e6]/30 rounded-lg flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-[#1e3a5f]" />
                </div>
                <div>
                  <CardTitle className="text-lg text-[#1e3a5f]">{category.category}</CardTitle>
                  <CardDescription>{category.items.length} integrations available</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center">
                        <Settings className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[#1e3a5f]">{item.name}</h3>
                          {item.status === 'coming_soon' && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.connected ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">Not connected</span>
                        </div>
                      )}
                      <Button
                        variant={item.status === 'coming_soon' ? 'secondary' : 'outline'}
                        size="sm"
                        disabled={item.status === 'coming_soon'}
                        className="min-w-[100px]"
                      >
                        {item.connected ? 'Configure' : 'Connect'}
                        {item.status !== 'coming_soon' && <ExternalLink className="h-3 w-3 ml-2" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Keys Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-[#1e3a5f]">API Configuration</CardTitle>
          <CardDescription>Manage your API keys and webhooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 bg-gray-50 rounded-lg text-center">
            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">API configuration will be available soon</p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
