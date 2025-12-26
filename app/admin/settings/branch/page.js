'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Percent,
  Save,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function BranchSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tenant, setTenant] = useState(null)
  const [branch, setBranch] = useState(null)
  const [tenantFormData, setTenantFormData] = useState({
    name: '',
    currency: 'KWD',
    tax_rate: 0,
    service_charge_rate: 0
  })
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    delivery_radius_km: 10,
    min_order_amount: 0,
    delivery_fee: 0
  })
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tenantRes, branchRes] = await Promise.all([
        fetch('/api/admin/settings/tenant'),
        fetch('/api/admin/settings/branch')
      ])
      
      const tenantData = await tenantRes.json()
      const branchData = await branchRes.json()
      
      if (tenantData.success && tenantData.data) {
        setTenant(tenantData.data)
        setTenantFormData({
          name: tenantData.data.name || '',
          currency: tenantData.data.currency || 'KWD',
          tax_rate: tenantData.data.tax_rate || 0,
          service_charge_rate: tenantData.data.service_charge_rate || 0
        })
      }
      
      if (branchData.success && branchData.data) {
        setBranch(branchData.data)
        setBranchFormData({
          name: branchData.data.name || '',
          code: branchData.data.code || '',
          address: branchData.data.address || '',
          city: branchData.data.city || '',
          phone: branchData.data.phone || '',
          email: branchData.data.email || '',
          delivery_radius_km: branchData.data.delivery_radius_km || 10,
          min_order_amount: branchData.data.min_order_amount || 0,
          delivery_fee: branchData.data.delivery_fee || 0
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load settings' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSaveTenant = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantFormData)
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Business settings updated' })
        setTenant(data.data)
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings' })
    }
    setSaving(false)
  }

  const handleSaveBranch = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings/branch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchFormData)
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Branch settings updated' })
        setBranch(data.data)
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings' })
    }
    setSaving(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Branch Settings</h1>
          <p className="text-gray-500 text-sm">Manage your restaurant and branch information</p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          className="border-[#1e3a5f] text-[#1e3a5f]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Business Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#d4af37]" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#1e3a5f]">Business Information</CardTitle>
                <CardDescription>General business settings and rates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={tenantFormData.name}
                  onChange={(e) => setTenantFormData({...tenantFormData, name: e.target.value})}
                  placeholder="Restaurant name"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={tenantFormData.currency}
                  onValueChange={(value) => setTenantFormData({...tenantFormData, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
                    <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Tax Rate (%)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tenantFormData.tax_rate}
                  onChange={(e) => setTenantFormData({...tenantFormData, tax_rate: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Service Charge (%)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tenantFormData.service_charge_rate}
                  onChange={(e) => setTenantFormData({...tenantFormData, service_charge_rate: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveTenant}
                className="bg-[#1e3a5f] hover:bg-[#152a45]"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Business Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Branch Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#a8c5e6]/30 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#1e3a5f]">Branch Information</CardTitle>
                <CardDescription>Branch-specific settings and contact info</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData({...branchFormData, name: e.target.value})}
                  placeholder="Branch name"
                />
              </div>
              <div className="space-y-2">
                <Label>Branch Code</Label>
                <Input
                  value={branchFormData.code}
                  onChange={(e) => setBranchFormData({...branchFormData, code: e.target.value})}
                  placeholder="e.g., BAM-SLW"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Textarea
                  value={branchFormData.address}
                  onChange={(e) => setBranchFormData({...branchFormData, address: e.target.value})}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={branchFormData.city}
                  onChange={(e) => setBranchFormData({...branchFormData, city: e.target.value})}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  value={branchFormData.phone}
                  onChange={(e) => setBranchFormData({...branchFormData, phone: e.target.value})}
                  placeholder="+965 XXXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={branchFormData.email}
                  onChange={(e) => setBranchFormData({...branchFormData, email: e.target.value})}
                  placeholder="branch@restaurant.com"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-[#1e3a5f] mb-4">Delivery Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Radius (km)</Label>
                  <Input
                    type="number"
                    value={branchFormData.delivery_radius_km}
                    onChange={(e) => setBranchFormData({...branchFormData, delivery_radius_km: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Order Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={branchFormData.min_order_amount}
                    onChange={(e) => setBranchFormData({...branchFormData, min_order_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Fee</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={branchFormData.delivery_fee}
                    onChange={(e) => setBranchFormData({...branchFormData, delivery_fee: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveBranch}
                className="bg-[#1e3a5f] hover:bg-[#152a45]"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Branch Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
