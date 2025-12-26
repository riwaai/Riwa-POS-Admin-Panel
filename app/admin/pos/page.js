'use client'

import { useState } from 'react'
import {
  Monitor,
  Wifi,
  WifiOff,
  Settings,
  Printer,
  CreditCard,
  Receipt,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function POSConfigPage() {
  const [posStatus] = useState('disconnected')
  const { toast } = useToast()

  const handleSaveConfig = () => {
    toast({ 
      variant: 'destructive', 
      title: 'POS Not Connected', 
      description: 'Please connect the POS application first' 
    })
  }

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">POS Configuration</h1>
          <p className="text-gray-500 text-sm">Configure Point of Sale settings and peripherals</p>
        </div>
        <Button
          variant="outline"
          className="border-[#1e3a5f] text-[#1e3a5f]"
          disabled
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync with POS
        </Button>
      </div>

      {/* Connection Status Alert */}
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>POS Not Connected</AlertTitle>
        <AlertDescription>
          The POS application is not connected to this admin panel. Settings configured here will sync when the POS connects.
        </AlertDescription>
      </Alert>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <WifiOff className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">POS Status</p>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Disconnected</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Printer className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Receipt Printer</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-gray-500">Not Configured</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Card Terminal</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-gray-500">Not Configured</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="receipt"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Receipt
          </TabsTrigger>
          <TabsTrigger
            value="hardware"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Hardware
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#1e3a5f]">General POS Settings</CardTitle>
              <CardDescription>Configure basic POS behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Order Type</Label>
                  <Select defaultValue="dine_in" disabled>
                    <SelectTrigger className="opacity-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine_in">Dine In</SelectItem>
                      <SelectItem value="takeaway">Takeaway</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quick Amounts</Label>
                  <Input defaultValue="1, 5, 10, 20" disabled className="opacity-50" />
                  <p className="text-xs text-gray-400">Comma-separated cash amounts</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                  <div>
                    <Label>Offline Mode</Label>
                    <p className="text-sm text-gray-500">Allow orders when internet is unavailable</p>
                  </div>
                  <Switch disabled defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                  <div>
                    <Label>Auto-print Kitchen Order</Label>
                    <p className="text-sm text-gray-500">Print to kitchen automatically on order</p>
                  </div>
                  <Switch disabled defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                  <div>
                    <Label>Auto-print Receipt</Label>
                    <p className="text-sm text-gray-500">Print receipt after payment</p>
                  </div>
                  <Switch disabled />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                  <div>
                    <Label>Require PIN for Refunds</Label>
                    <p className="text-sm text-gray-500">Manager PIN required for refund operations</p>
                  </div>
                  <Switch disabled defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Settings */}
        <TabsContent value="receipt" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#1e3a5f]">Receipt Customization</CardTitle>
              <CardDescription>Customize receipt layout and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Receipt Header Text</Label>
                  <Input defaultValue="Bam Burgers" disabled className="opacity-50" />
                </div>
                <div className="space-y-2">
                  <Label>Receipt Footer Text</Label>
                  <Input defaultValue="Thank you for visiting!" disabled className="opacity-50" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                  <Label>Show Logo on Receipt</Label>
                  <Switch disabled defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                  <Label>Show Tax Breakdown</Label>
                  <Switch disabled defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                  <Label>Show QR Code</Label>
                  <Switch disabled />
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="border rounded-lg p-4 bg-white max-w-xs mx-auto opacity-50">
                <div className="text-center border-b pb-2 mb-2">
                  <p className="font-bold">Bam Burgers</p>
                  <p className="text-xs text-gray-500">Block 5, Salwa Road</p>
                  <p className="text-xs text-gray-500">+965 9999 8888</p>
                </div>
                <div className="text-xs space-y-1">
                  <p>Order #: BAM-001234</p>
                  <p>Date: Jan 1, 2025 12:30 PM</p>
                  <div className="border-t border-dashed my-2"></div>
                  <div className="flex justify-between"><span>1x Classic Burger</span><span>2.500</span></div>
                  <div className="flex justify-between"><span>1x Fries</span><span>0.750</span></div>
                  <div className="border-t border-dashed my-2"></div>
                  <div className="flex justify-between font-bold"><span>Total</span><span>3.250 KWD</span></div>
                </div>
                <div className="text-center border-t mt-2 pt-2">
                  <p className="text-xs">Thank you for visiting!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hardware Settings */}
        <TabsContent value="hardware" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#1e3a5f]">Hardware Configuration</CardTitle>
              <CardDescription>Configure connected devices and peripherals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Receipt Printer */}
              <div className="p-4 border rounded-lg opacity-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Printer className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium">Receipt Printer</h3>
                      <p className="text-sm text-gray-500">Thermal receipt printer</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    <XCircle className="h-3 w-3 mr-1" /> Not Connected
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Printer Type</Label>
                    <Select defaultValue="thermal" disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermal">Thermal (80mm)</SelectItem>
                        <SelectItem value="thermal_58">Thermal (58mm)</SelectItem>
                        <SelectItem value="network">Network Printer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Connection</Label>
                    <Select defaultValue="usb" disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usb">USB</SelectItem>
                        <SelectItem value="bluetooth">Bluetooth</SelectItem>
                        <SelectItem value="network">Network/IP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Kitchen Printer */}
              <div className="p-4 border rounded-lg opacity-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Printer className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium">Kitchen Printer</h3>
                      <p className="text-sm text-gray-500">Kitchen order tickets</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    <XCircle className="h-3 w-3 mr-1" /> Not Connected
                  </Badge>
                </div>
              </div>

              {/* Card Terminal */}
              <div className="p-4 border rounded-lg opacity-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium">Card Terminal</h3>
                      <p className="text-sm text-gray-500">Payment terminal integration</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    <XCircle className="h-3 w-3 mr-1" /> Not Connected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button (disabled) */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveConfig}
          className="bg-[#1e3a5f] hover:bg-[#152a45] opacity-50"
          disabled
        >
          Save Configuration
        </Button>
      </div>
    </div>
  )
}
