'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Copy,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { format } from 'date-fns'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    usage_per_customer: '1',
    valid_from: '',
    valid_until: '',
    status: 'active'
  })
  const { toast } = useToast()

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/coupons')
      const data = await response.json()
      if (data.success) {
        setCoupons(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load coupons' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const filteredCoupons = coupons.filter(coupon => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return coupon.code?.toLowerCase().includes(query) ||
           coupon.description?.toLowerCase().includes(query)
  })

  const openAddCoupon = () => {
    setSelectedCoupon(null)
    const today = new Date().toISOString().split('T')[0]
    const nextMonth = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      usage_per_customer: '1',
      valid_from: today,
      valid_until: nextMonth,
      status: 'active'
    })
    setDialogOpen(true)
  }

  const openEditCoupon = (coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value?.toString() || '',
      min_order_amount: coupon.min_order_amount?.toString() || '',
      max_discount: coupon.max_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      usage_per_customer: coupon.usage_per_customer?.toString() || '1',
      valid_from: coupon.valid_from?.split('T')[0] || '',
      valid_until: coupon.valid_until?.split('T')[0] || '',
      status: coupon.status || 'active'
    })
    setDialogOpen(true)
  }

  const handleSaveCoupon = async () => {
    if (!formData.code || !formData.discount_value) {
      toast({ variant: 'destructive', title: 'Error', description: 'Code and discount value are required' })
      return
    }
    
    setSaving(true)
    try {
      const url = selectedCoupon ? `/api/admin/coupons/${selectedCoupon.id}` : '/api/admin/coupons'
      const method = selectedCoupon ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          discount_value: parseFloat(formData.discount_value),
          min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
          max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
          usage_per_customer: parseInt(formData.usage_per_customer) || 1
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: `Coupon ${selectedCoupon ? 'updated' : 'created'} successfully` })
        setDialogOpen(false)
        fetchCoupons()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save coupon' })
    }
    setSaving(false)
  }

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/coupons/${selectedCoupon.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Coupon deleted successfully' })
        setDeleteDialogOpen(false)
        fetchCoupons()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete coupon' })
    }
    setSaving(false)
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const getStatusBadge = (coupon) => {
    const now = new Date()
    const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null
    
    if (coupon.status === 'inactive') {
      return <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
    }
    if (validUntil && now > validUntil) {
      return <Badge className="bg-red-100 text-red-700">Expired</Badge>
    }
    if (validFrom && now < validFrom) {
      return <Badge className="bg-yellow-100 text-yellow-700">Scheduled</Badge>
    }
    return <Badge className="bg-green-100 text-green-700">Active</Badge>
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
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Coupons & Discounts</h1>
          <p className="text-gray-500 text-sm">Create and manage promotional codes</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchCoupons}
            variant="outline"
            className="border-[#1e3a5f] text-[#1e3a5f]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={openAddCoupon}
            className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Coupons</p>
                <p className="text-xl font-bold text-[#1e3a5f]">{coupons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-xl font-bold text-[#1e3a5f]">
                  {coupons.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Percentage</p>
                <p className="text-xl font-bold text-[#1e3a5f]">
                  {coupons.filter(c => c.discount_type === 'percentage').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fixed Amount</p>
                <p className="text-xl font-bold text-[#1e3a5f]">
                  {coupons.filter(c => c.discount_type === 'fixed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-[#1e3a5f] font-semibold">Code</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Description</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Discount</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Min Order</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Usage</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Valid Until</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-[#1e3a5f]/10 px-2 py-1 rounded font-mono text-[#1e3a5f] font-bold">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(coupon.code)}
                        >
                          {copied === coupon.code ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                      {coupon.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {coupon.discount_type === 'percentage' ? (
                          <><Percent className="h-3 w-3 text-purple-600" /><span className="font-semibold">{coupon.discount_value}%</span></>
                        ) : (
                          <><DollarSign className="h-3 w-3 text-green-600" /><span className="font-semibold">{coupon.discount_value} KWD</span></>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {coupon.min_order_amount ? `${coupon.min_order_amount} KWD` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {coupon.times_used || 0} / {coupon.usage_limit || '∞'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {coupon.valid_until ? format(new Date(coupon.valid_until), 'MMM d, yyyy') : 'No limit'}
                    </TableCell>
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditCoupon(coupon)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedCoupon(coupon)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-12">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No coupons found</p>
                    <Button onClick={openAddCoupon} className="mt-4 bg-[#1e3a5f]">
                      Create First Coupon
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">
              {selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
            <DialogDescription>
              {selectedCoupon ? 'Update coupon details' : 'Set up a new promotional code'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coupon Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., SUMMER20"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData({...formData, discount_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (KWD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Summer sale - 20% off all items"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                  placeholder={formData.discount_type === 'percentage' ? 'e.g., 20' : 'e.g., 5.00'}
                />
              </div>
              {formData.discount_type === 'percentage' && (
                <div className="space-y-2">
                  <Label>Max Discount (KWD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({...formData, max_discount: e.target.value})}
                    placeholder="Maximum discount cap"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Order Amount (KWD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                  placeholder="No minimum"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Uses Per Customer</Label>
                <Input
                  type="number"
                  value={formData.usage_per_customer}
                  onChange={(e) => setFormData({...formData, usage_per_customer: e.target.value})}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData({...formData, status: checked ? 'active' : 'inactive'})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCoupon}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={saving}
            >
              {saving ? 'Saving...' : (selectedCoupon ? 'Update Coupon' : 'Create Coupon')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete coupon "{selectedCoupon?.code}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCoupon}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
