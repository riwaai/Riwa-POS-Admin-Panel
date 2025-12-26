'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Layers,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function ModifierGroupsPage() {
  const [modifierGroups, setModifierGroups] = useState([])
  const [modifiers, setModifiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [modifierDialogOpen, setModifierDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedModifier, setSelectedModifier] = useState(null)
  const [saving, setSaving] = useState(false)
  
  const [groupFormData, setGroupFormData] = useState({
    name_en: '',
    name_ar: '',
    min_select: 0,
    max_select: 1,
    required: false
  })
  
  const [modifierFormData, setModifierFormData] = useState({
    modifier_group_id: '',
    name_en: '',
    name_ar: '',
    price: 0,
    default_selected: false
  })
  
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [groupsRes, modifiersRes] = await Promise.all([
        fetch('/api/admin/modifier-groups'),
        fetch('/api/admin/modifiers')
      ])
      const groupsData = await groupsRes.json()
      const modifiersData = await modifiersRes.json()
      
      if (groupsData.success) setModifierGroups(groupsData.data || [])
      if (modifiersData.success) setModifiers(modifiersData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getGroupModifiers = (groupId) => {
    return modifiers.filter(m => m.modifier_group_id === groupId)
  }

  const openAddGroup = () => {
    setSelectedGroup(null)
    setGroupFormData({
      name_en: '',
      name_ar: '',
      min_select: 0,
      max_select: 1,
      required: false
    })
    setGroupDialogOpen(true)
  }

  const openEditGroup = (group) => {
    setSelectedGroup(group)
    setGroupFormData({
      name_en: group.name_en || '',
      name_ar: group.name_ar || '',
      min_select: group.min_select || 0,
      max_select: group.max_select || 1,
      required: group.required || false
    })
    setGroupDialogOpen(true)
  }

  const openAddModifier = (group) => {
    setSelectedModifier(null)
    setModifierFormData({
      modifier_group_id: group.id,
      name_en: '',
      name_ar: '',
      price: 0,
      default_selected: false
    })
    setModifierDialogOpen(true)
  }

  const openEditModifier = (modifier) => {
    setSelectedModifier(modifier)
    setModifierFormData({
      modifier_group_id: modifier.modifier_group_id,
      name_en: modifier.name_en || '',
      name_ar: modifier.name_ar || '',
      price: modifier.price || 0,
      default_selected: modifier.default_selected || false
    })
    setModifierDialogOpen(true)
  }

  const handleSaveGroup = async () => {
    if (!groupFormData.name_en) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter group name' })
      return
    }
    
    setSaving(true)
    try {
      const url = selectedGroup ? `/api/admin/modifier-groups/${selectedGroup.id}` : '/api/admin/modifier-groups'
      const method = selectedGroup ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupFormData)
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: `Group ${selectedGroup ? 'updated' : 'created'} successfully` })
        setGroupDialogOpen(false)
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save group' })
    }
    setSaving(false)
  }

  const handleSaveModifier = async () => {
    if (!modifierFormData.name_en) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter modifier name' })
      return
    }
    
    setSaving(true)
    try {
      const url = selectedModifier ? `/api/admin/modifiers/${selectedModifier.id}` : '/api/admin/modifiers'
      const method = selectedModifier ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modifierFormData,
          price: parseFloat(modifierFormData.price) || 0
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: `Modifier ${selectedModifier ? 'updated' : 'created'} successfully` })
        setModifierDialogOpen(false)
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save modifier' })
    }
    setSaving(false)
  }

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/modifier-groups/${selectedGroup.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Group deleted successfully' })
        setDeleteDialogOpen(false)
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete group' })
    }
    setSaving(false)
  }

  const handleDeleteModifier = async (modifierId) => {
    try {
      const response = await fetch(`/api/admin/modifiers/${modifierId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Modifier deleted successfully' })
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete modifier' })
    }
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
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Modifier Groups</h1>
          <p className="text-gray-500 text-sm">Manage item modifiers and customizations</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchData}
            variant="outline"
            className="border-[#1e3a5f] text-[#1e3a5f]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={openAddGroup}
            className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>
      </div>

      {/* Modifier Groups */}
      <div className="space-y-4">
        {modifierGroups.length > 0 ? (
          modifierGroups.map((group) => (
            <Card key={group.id} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#a8c5e6]/30 rounded-lg flex items-center justify-center">
                      <Layers className="h-5 w-5 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1e3a5f]">{group.name_en}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {group.name_ar && <span dir="rtl">{group.name_ar}</span>}
                        <span className="text-xs">
                          Select: {group.min_select} - {group.max_select}
                        </span>
                        {group.required && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddModifier(group)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Modifier
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditGroup(group)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedGroup(group)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-[#1e3a5f] font-semibold">Name (EN)</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold">Name (AR)</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold">Price</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold">Default</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getGroupModifiers(group.id).length > 0 ? (
                      getGroupModifiers(group.id).map((modifier) => (
                        <TableRow key={modifier.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{modifier.name_en}</TableCell>
                          <TableCell dir="rtl" className="text-gray-600">{modifier.name_ar || '-'}</TableCell>
                          <TableCell className="font-semibold">
                            {modifier.price > 0 ? `+${modifier.price?.toFixed(2)} KWD` : 'Free'}
                          </TableCell>
                          <TableCell>
                            {modifier.default_selected ? (
                              <Badge className="bg-green-100 text-green-700">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-400">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModifier(modifier)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteModifier(modifier.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                          No modifiers in this group
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-400">No modifier groups yet</p>
              <Button
                onClick={openAddGroup}
                className="mt-4 bg-[#1e3a5f] hover:bg-[#152a45]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Group Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">
              {selectedGroup ? 'Edit Modifier Group' : 'Add Modifier Group'}
            </DialogTitle>
            <DialogDescription>
              Configure the modifier group settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input
                  value={groupFormData.name_en}
                  onChange={(e) => setGroupFormData({...groupFormData, name_en: e.target.value})}
                  placeholder="e.g., Toppings"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Arabic)</Label>
                <Input
                  value={groupFormData.name_ar}
                  onChange={(e) => setGroupFormData({...groupFormData, name_ar: e.target.value})}
                  placeholder="الإضافات"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Selection</Label>
                <Input
                  type="number"
                  min="0"
                  value={groupFormData.min_select}
                  onChange={(e) => setGroupFormData({...groupFormData, min_select: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Selection</Label>
                <Input
                  type="number"
                  min="1"
                  value={groupFormData.max_select}
                  onChange={(e) => setGroupFormData({...groupFormData, max_select: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Required Selection</Label>
              <Switch
                checked={groupFormData.required}
                onCheckedChange={(checked) => setGroupFormData({...groupFormData, required: checked})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveGroup}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={saving}
            >
              {saving ? 'Saving...' : (selectedGroup ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modifier Dialog */}
      <Dialog open={modifierDialogOpen} onOpenChange={setModifierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">
              {selectedModifier ? 'Edit Modifier' : 'Add Modifier'}
            </DialogTitle>
            <DialogDescription>
              Configure the modifier details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input
                  value={modifierFormData.name_en}
                  onChange={(e) => setModifierFormData({...modifierFormData, name_en: e.target.value})}
                  placeholder="e.g., Extra Cheese"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Arabic)</Label>
                <Input
                  value={modifierFormData.name_ar}
                  onChange={(e) => setModifierFormData({...modifierFormData, name_ar: e.target.value})}
                  placeholder="جبنة إضافية"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Price (KWD)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={modifierFormData.price}
                onChange={(e) => setModifierFormData({...modifierFormData, price: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Default Selected</Label>
              <Switch
                checked={modifierFormData.default_selected}
                onCheckedChange={(checked) => setModifierFormData({...modifierFormData, default_selected: checked})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModifierDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveModifier}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={saving}
            >
              {saving ? 'Saving...' : (selectedModifier ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Modifier Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedGroup?.name_en}"? This will also delete all modifiers in this group.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGroup}
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
