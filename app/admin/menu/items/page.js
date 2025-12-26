'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  ImageIcon,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function MenuItemsPage() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    category_id: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    base_price: '',
    sku: '',
    image_url: '',
    status: 'active'
  })
  const [categoryFormData, setCategoryFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    sort_order: 0
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/items')
      ])
      const categoriesData = await categoriesRes.json()
      const itemsData = await itemsRes.json()
      
      if (categoriesData.success) setCategories(categoriesData.data || [])
      if (itemsData.success) setItems(itemsData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name_ar?.includes(searchQuery)
    return matchesCategory && matchesSearch
  })

  const openAddItem = () => {
    setSelectedItem(null)
    setFormData({
      category_id: categories[0]?.id || '',
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      base_price: '',
      sku: '',
      image_url: '',
      status: 'active'
    })
    setItemDialogOpen(true)
  }

  const openEditItem = (item) => {
    setSelectedItem(item)
    setFormData({
      category_id: item.category_id || '',
      name_en: item.name_en || '',
      name_ar: item.name_ar || '',
      description_en: item.description_en || '',
      description_ar: item.description_ar || '',
      base_price: item.base_price?.toString() || '',
      sku: item.sku || '',
      image_url: item.image_url || '',
      status: item.status || 'active'
    })
    setItemDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (!formData.name_en || !formData.base_price || !formData.category_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill required fields' })
      return
    }
    
    setSaving(true)
    try {
      const url = selectedItem ? `/api/admin/items/${selectedItem.id}` : '/api/admin/items'
      const method = selectedItem ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          base_price: parseFloat(formData.base_price)
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: `Item ${selectedItem ? 'updated' : 'created'} successfully` })
        setItemDialogOpen(false)
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save item' })
    }
    setSaving(false)
  }

  const handleDeleteItem = async () => {
    if (!selectedItem) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/items/${selectedItem.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Item deleted successfully' })
        setDeleteDialogOpen(false)
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete item' })
    }
    setSaving(false)
  }

  const handleSaveCategory = async () => {
    if (!categoryFormData.name_en) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter category name' })
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData)
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Category created successfully' })
        setCategoryDialogOpen(false)
        setCategoryFormData({ name_en: '', name_ar: '', description_en: '', description_ar: '', sort_order: 0 })
        fetchData()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create category' })
    }
    setSaving(false)
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name_en || 'Unknown'
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
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Menu Items</h1>
          <p className="text-gray-500 text-sm">Manage your menu items and categories</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCategoryDialogOpen(true)}
            variant="outline"
            className="border-[#1e3a5f] text-[#1e3a5f]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button
            onClick={openAddItem}
            className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={fetchData}
              variant="outline"
              className="border-gray-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="bg-white border shadow-sm h-auto flex-wrap">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
          >
            All Items ({items.length})
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
            >
              {category.name_en} ({items.filter(i => i.category_id === category.id).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-[#1e3a5f] font-semibold">Image</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold">Name (EN)</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold">Name (AR)</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold">Category</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold">Price</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                      <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell>
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name_en}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{item.name_en}</TableCell>
                          <TableCell className="text-gray-600" dir="rtl">{item.name_ar}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-[#a8c5e6]/20 text-[#1e3a5f] border-[#a8c5e6]">
                              {getCategoryName(item.category_id)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-[#1e3a5f]">
                            {item.base_price?.toFixed(2)} KWD
                          </TableCell>
                          <TableCell>
                            <Badge className={item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditItem(item)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedItem(item)
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
                        <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">
              {selectedItem ? 'Edit Item' : 'Add New Item'}
            </DialogTitle>
            <DialogDescription>
              Fill in the item details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({...formData, category_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="Item SKU"
              />
            </div>

            <div className="space-y-2">
              <Label>Name (English) *</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                placeholder="Enter name in English"
              />
            </div>

            <div className="space-y-2">
              <Label>Name (Arabic)</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                placeholder="أدخل الاسم بالعربية"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Arabic)</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                placeholder="أدخل الوصف بالعربية"
                dir="rtl"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Base Price (KWD) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center justify-between col-span-full">
              <Label>Active Status</Label>
              <Switch
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData({...formData, status: checked ? 'active' : 'inactive'})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveItem}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={saving}
            >
              {saving ? 'Saving...' : (selectedItem ? 'Update Item' : 'Create Item')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">Add New Category</DialogTitle>
            <DialogDescription>Create a new menu category</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name (English) *</Label>
              <Input
                value={categoryFormData.name_en}
                onChange={(e) => setCategoryFormData({...categoryFormData, name_en: e.target.value})}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label>Name (Arabic)</Label>
              <Input
                value={categoryFormData.name_ar}
                onChange={(e) => setCategoryFormData({...categoryFormData, name_ar: e.target.value})}
                placeholder="اسم الفئة"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={categoryFormData.sort_order}
                onChange={(e) => setCategoryFormData({...categoryFormData, sort_order: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedItem?.name_en}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteItem}
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
