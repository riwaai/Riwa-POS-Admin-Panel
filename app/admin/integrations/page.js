'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  Truck,
  Store,
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  TestTube
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

// Integration configurations
const INTEGRATIONS = {
  payments: [
    {
      id: 'myfatoorah',
      name: 'MyFatoorah',
      description: 'Payment gateway supporting KNET, Visa, Mastercard, Apple Pay',
      logo: '💳',
      docs: 'https://docs.myfatoorah.com',
      fields: [
        { key: 'api_key', label: 'API Key (Token)', type: 'password', required: true },
        { key: 'environment', label: 'Environment', type: 'select', options: ['test', 'live'], required: true },
      ],
      testable: true
    },
    {
      id: 'upayments',
      name: 'UPayments',
      description: 'Kuwait payment gateway with KNET, cards, and digital wallets',
      logo: '💰',
      docs: 'https://developers.upayments.com',
      fields: [
        { key: 'merchant_id', label: 'Merchant ID', type: 'text', required: true },
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'production'], required: true },
      ],
      testable: true
    }
  ],
  aggregators: [
    {
      id: 'talabat',
      name: 'Talabat',
      description: 'Receive orders from Talabat marketplace',
      logo: '🍊',
      docs: 'https://www.talabat.com/partners',
      fields: [
        { key: 'vendor_id', label: 'Vendor ID', type: 'text', required: true },
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'branch_code', label: 'Branch Code', type: 'text', required: true },
      ],
      testable: false,
      note: 'Contact Talabat support to obtain API credentials'
    },
    {
      id: 'deliveroo',
      name: 'Deliveroo',
      description: 'Receive orders from Deliveroo marketplace',
      logo: '🥡',
      docs: 'https://deliveroo.co.uk/restaurant-hub',
      fields: [
        { key: 'restaurant_id', label: 'Restaurant ID', type: 'text', required: true },
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
      testable: false,
      note: 'Contact Deliveroo support to obtain API credentials'
    },
    {
      id: 'careem',
      name: 'Careem NOW',
      description: 'Receive orders from Careem food delivery',
      logo: '🚗',
      status: 'coming_soon'
    }
  ],
  delivery: [
    {
      id: 'armada',
      name: 'Armada Delivery',
      description: 'Last-mile delivery service for Kuwait, Bahrain & KSA',
      logo: '🚚',
      docs: 'https://docs.armadadelivery.com',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'webhook_key', label: 'Webhook Secret (12-32 chars)', type: 'password', required: false },
        { key: 'environment', label: 'Environment', type: 'select', options: ['staging', 'production'], required: true },
      ],
      testable: true,
      note: 'Generate API key from Armada Merchant Dashboard > Settings > API Settings'
    },
    {
      id: 'wiyak',
      name: 'Wiyak Delivery',
      description: 'Local delivery service',
      logo: '📦',
      status: 'coming_soon'
    }
  ]
}

export default function IntegrationsConfigPage() {
  const [integrations, setIntegrations] = useState({})
  const [loading, setLoading] = useState(true)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [formData, setFormData] = useState({})
  const [showSecrets, setShowSecrets] = useState({})
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  const fetchIntegrations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/integrations')
      const data = await response.json()
      if (data.success) {
        setIntegrations(data.data || {})
      }
    } catch (error) {
      console.error('Error fetching integrations:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const openConfig = (integration, category) => {
    setSelectedIntegration({ ...integration, category })
    const existingConfig = integrations[integration.id] || {}
    setFormData({
      enabled: existingConfig.enabled || false,
      ...existingConfig.config
    })
    setShowSecrets({})
    setConfigDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const config = { ...formData }
      delete config.enabled
      
      const response = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: selectedIntegration.id,
          category: selectedIntegration.category,
          enabled: formData.enabled,
          config
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Integration settings saved' })
        setConfigDialogOpen(false)
        fetchIntegrations()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings' })
    }
    setSaving(false)
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const config = { ...formData }
      delete config.enabled
      
      const response = await fetch('/api/admin/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: selectedIntegration.id,
          config
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Connection Successful', description: data.message || 'Integration is working correctly' })
      } else {
        toast({ variant: 'destructive', title: 'Connection Failed', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Test Failed', description: 'Could not test connection' })
    }
    setTesting(false)
  }

  const renderIntegrationCard = (integration, category) => {
    const config = integrations[integration.id]
    const isConnected = config?.enabled && config?.config
    const isComingSoon = integration.status === 'coming_soon'

    return (
      <div
        key={integration.id}
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center text-2xl">
            {integration.logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#1e3a5f]">{integration.name}</h3>
              {isComingSoon && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  Coming Soon
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{integration.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : !isComingSoon ? (
            <div className="flex items-center gap-2 text-gray-400">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Not configured</span>
            </div>
          ) : null}
          <Button
            variant={isComingSoon ? 'secondary' : isConnected ? 'outline' : 'default'}
            size="sm"
            disabled={isComingSoon}
            onClick={() => openConfig(integration, category)}
            className={!isComingSoon && !isConnected ? 'bg-[#1e3a5f] hover:bg-[#152a45]' : ''}
          >
            {isConnected ? 'Configure' : 'Connect'}
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Integrations</h1>
          <p className="text-gray-500 text-sm">Connect payment gateways, aggregators, and delivery services</p>
        </div>
        <Button
          onClick={fetchIntegrations}
          variant="outline"
          className="border-[#1e3a5f] text-[#1e3a5f]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="payments">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="aggregators"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            <Store className="h-4 w-4 mr-2" />
            Aggregators
          </TabsTrigger>
          <TabsTrigger
            value="delivery"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            <Truck className="h-4 w-4 mr-2" />
            Delivery
          </TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#1e3a5f]">Payment Gateways</CardTitle>
              <CardDescription>Accept online payments from customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {INTEGRATIONS.payments.map(integration => renderIntegrationCard(integration, 'payments'))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aggregators Tab */}
        <TabsContent value="aggregators" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#1e3a5f]">Food Aggregators</CardTitle>
              <CardDescription>Receive orders from marketplace platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {INTEGRATIONS.aggregators.map(integration => renderIntegrationCard(integration, 'aggregators'))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#1e3a5f]">Delivery Services</CardTitle>
              <CardDescription>Last-mile delivery providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {INTEGRATIONS.delivery.map(integration => renderIntegrationCard(integration, 'delivery'))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f] flex items-center gap-2">
              <span className="text-2xl">{selectedIntegration?.logo}</span>
              {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Enable toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label className="font-medium">Enable Integration</Label>
              <Switch
                checked={formData.enabled || false}
                onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
              />
            </div>

            {/* API Note */}
            {selectedIntegration?.note && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {selectedIntegration.note}
                </AlertDescription>
              </Alert>
            )}

            {/* Configuration fields */}
            {selectedIntegration?.fields?.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label} {field.required && '*'}</Label>
                {field.type === 'select' ? (
                  <Select
                    value={formData[field.key] || ''}
                    onValueChange={(value) => setFormData({...formData, [field.key]: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map(opt => (
                        <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'password' ? (
                  <div className="relative">
                    <Input
                      type={showSecrets[field.key] ? 'text' : 'password'}
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                      placeholder={`Enter ${field.label}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets({...showSecrets, [field.key]: !showSecrets[field.key]})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                ) : (
                  <Input
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                    placeholder={`Enter ${field.label}`}
                  />
                )}
              </div>
            ))}

            {/* Documentation link */}
            {selectedIntegration?.docs && (
              <a
                href={selectedIntegration.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#1e3a5f] hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View API Documentation
              </a>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedIntegration?.testable && (
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing || saving}
                className="w-full sm:w-auto"
              >
                {testing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing...</>
                ) : (
                  <><TestTube className="h-4 w-4 mr-2" /> Test Connection</>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={saving}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Configuration</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
