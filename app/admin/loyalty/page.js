'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Gift,
  Star,
  Award,
  Coins,
  RefreshCw,
  Settings,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function LoyaltyPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    points_per_kwd: 10,
    points_value: 0.01, // 1 point = 0.01 KWD
    min_redemption_points: 100,
    max_redemption_percent: 50,
    welcome_bonus: 50
  })
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState(null)
  const [items, setItems] = useState([])
  const [rewardFormData, setRewardFormData] = useState({
    name: '',
    name_ar: '',
    type: 'discount',
    points_required: '',
    discount_value: '',
    item_id: '',
    status: 'active'
  })
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [settingsRes, rewardsRes, itemsRes] = await Promise.all([
        fetch('/api/admin/loyalty/settings'),
        fetch('/api/admin/loyalty/rewards'),
        fetch('/api/admin/items')
      ])
      
      const settingsData = await settingsRes.json()
      const rewardsData = await rewardsRes.json()
      const itemsData = await itemsRes.json()
      
      if (settingsData.success && settingsData.data) {
        setSettings(settingsData.data)
      }
      if (rewardsData.success) {
        setRewards(rewardsData.data || [])
      }
      if (itemsData.success) {
        setItems(itemsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/loyalty/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Loyalty settings saved' })
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings' })
    }
    setSaving(false)
  }

  const openAddReward = () => {
    setSelectedReward(null)
    setRewardFormData({
      name: '',
      name_ar: '',
      type: 'discount',
      points_required: '',
      discount_value: '',
      item_id: '',
      status: 'active'
    })
    setRewardDialogOpen(true)
  }

  const openEditReward = (reward) => {
    setSelectedReward(reward)
    setRewardFormData({
      name: reward.name || '',
      name_ar: reward.name_ar || '',
      type: reward.type || 'discount',
      points_required: reward.points_required?.toString() || '',
      discount_value: reward.discount_value?.toString() || '',
      item_id: reward.item_id || '',
      status: reward.status || 'active'
    })
    setRewardDialogOpen(true)
  }

  const handleSaveReward = async () => {
    if (!rewardFormData.name || !rewardFormData.points_required) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name and points required are mandatory' })
      return
    }
    
    setSaving(true)
    try {
      const url = selectedReward ? `/api/admin/loyalty/rewards/${selectedReward.id}` : '/api/admin/loyalty/rewards'
      const method = selectedReward ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rewardFormData,
          points_required: parseInt(rewardFormData.points_required),
          discount_value: rewardFormData.discount_value ? parseFloat(rewardFormData.discount_value) : null
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: `Reward ${selectedReward ? 'updated' : 'created'} successfully` })
        setRewardDialogOpen(false)
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save reward' })
    }
    setSaving(false)
  }

  const handleDeleteReward = async () => {
    if (!selectedReward) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/loyalty/rewards/${selectedReward.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Reward deleted successfully' })
        setDeleteDialogOpen(false)
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete reward' })
    }
    setSaving(false)
  }

  const getItemName = (itemId) => {
    const item = items.find(i => i.id === itemId)
    return item?.name_en || 'Unknown Item'
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
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Loyalty Program</h1>
          <p className="text-gray-500 text-sm">Configure points system and rewards</p>
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

      <Tabs defaultValue="settings">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-[#1e3a5f]">Loyalty Program Settings</CardTitle>
                  <CardDescription>Configure how customers earn and redeem points</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Program Enabled</Label>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Earning Points */}
              <div className="p-4 bg-gradient-to-r from-[#d4af37]/10 to-transparent rounded-lg">
                <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <Coins className="h-5 w-5 text-[#d4af37]" />
                  Earning Points
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Points Earned Per 1 KWD Spent</Label>
                    <Input
                      type="number"
                      value={settings.points_per_kwd}
                      onChange={(e) => setSettings({...settings, points_per_kwd: parseInt(e.target.value) || 0})}
                    />
                    <p className="text-xs text-gray-500">Customer earns {settings.points_per_kwd} points for every 1 KWD spent</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Welcome Bonus Points</Label>
                    <Input
                      type="number"
                      value={settings.welcome_bonus}
                      onChange={(e) => setSettings({...settings, welcome_bonus: parseInt(e.target.value) || 0})}
                    />
                    <p className="text-xs text-gray-500">Points given when customer signs up</p>
                  </div>
                </div>
              </div>

              {/* Redeeming Points */}
              <div className="p-4 bg-gradient-to-r from-[#a8c5e6]/20 to-transparent rounded-lg">
                <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#1e3a5f]" />
                  Redeeming Points
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Point Value (KWD per point)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={settings.points_value}
                      onChange={(e) => setSettings({...settings, points_value: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-xs text-gray-500">100 points = {(100 * settings.points_value).toFixed(2)} KWD</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Points to Redeem</Label>
                    <Input
                      type="number"
                      value={settings.min_redemption_points}
                      onChange={(e) => setSettings({...settings, min_redemption_points: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Redemption (% of order)</Label>
                    <Input
                      type="number"
                      max="100"
                      value={settings.max_redemption_percent}
                      onChange={(e) => setSettings({...settings, max_redemption_percent: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  className="bg-[#1e3a5f] hover:bg-[#152a45]"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-[#1e3a5f]">Rewards Catalog</CardTitle>
                  <CardDescription>Items customers can redeem with their points</CardDescription>
                </div>
                <Button
                  onClick={openAddReward}
                  className="bg-[#1e3a5f] hover:bg-[#152a45]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#1e3a5f] font-semibold">Reward</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Type</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Points Required</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Value</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.length > 0 ? (
                    rewards.map((reward) => (
                      <TableRow key={reward.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                              {reward.type === 'free_item' ? (
                                <Gift className="h-5 w-5 text-[#d4af37]" />
                              ) : (
                                <Award className="h-5 w-5 text-[#d4af37]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{reward.name}</p>
                              {reward.name_ar && <p className="text-sm text-gray-500" dir="rtl">{reward.name_ar}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={reward.type === 'free_item' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}>
                            {reward.type === 'free_item' ? 'Free Item' : 'Discount'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-[#d4af37]" />
                            <span className="font-semibold">{reward.points_required}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {reward.type === 'free_item' ? (
                            <span className="text-sm">{getItemName(reward.item_id)}</span>
                          ) : (
                            <span className="font-semibold">{reward.discount_value} KWD off</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={reward.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {reward.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditReward(reward)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                              setSelectedReward(reward)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                        <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No rewards configured</p>
                        <Button onClick={openAddReward} className="mt-4 bg-[#1e3a5f]">
                          Add First Reward
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Reward Dialog */}
      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">
              {selectedReward ? 'Edit Reward' : 'Add New Reward'}
            </DialogTitle>
            <DialogDescription>
              Configure a reward that customers can redeem with their points
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reward Name (English) *</Label>
                <Input
                  value={rewardFormData.name}
                  onChange={(e) => setRewardFormData({...rewardFormData, name: e.target.value})}
                  placeholder="e.g., Free Fries"
                />
              </div>
              <div className="space-y-2">
                <Label>Reward Name (Arabic)</Label>
                <Input
                  value={rewardFormData.name_ar}
                  onChange={(e) => setRewardFormData({...rewardFormData, name_ar: e.target.value})}
                  placeholder="بطاطس مجانية"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reward Type *</Label>
                <Select
                  value={rewardFormData.type}
                  onValueChange={(value) => setRewardFormData({...rewardFormData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount (KWD off)</SelectItem>
                    <SelectItem value="free_item">Free Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points Required *</Label>
                <Input
                  type="number"
                  value={rewardFormData.points_required}
                  onChange={(e) => setRewardFormData({...rewardFormData, points_required: e.target.value})}
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            {rewardFormData.type === 'discount' ? (
              <div className="space-y-2">
                <Label>Discount Value (KWD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={rewardFormData.discount_value}
                  onChange={(e) => setRewardFormData({...rewardFormData, discount_value: e.target.value})}
                  placeholder="e.g., 2.00"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Free Item *</Label>
                <Select
                  value={rewardFormData.item_id}
                  onValueChange={(value) => setRewardFormData({...rewardFormData, item_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name_en} - {item.base_price} KWD</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch
                checked={rewardFormData.status === 'active'}
                onCheckedChange={(checked) => setRewardFormData({...rewardFormData, status: checked ? 'active' : 'inactive'})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveReward}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={saving}
            >
              {saving ? 'Saving...' : (selectedReward ? 'Update Reward' : 'Create Reward')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedReward?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReward}
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
