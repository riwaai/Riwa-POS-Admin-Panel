'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ChefHat,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  Printer,
  Plus,
  RefreshCw,
  Volume2,
  VolumeX,
  Store,
  Globe,
  Bike
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

const TENANT_ID = 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

const ORDER_STATUSES = [
  { key: 'placed', label: 'Order Placed', icon: Clock, color: 'bg-blue-500' },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle, color: 'bg-yellow-500' },
  { key: 'preparing', label: 'Freshly Preparing', icon: ChefHat, color: 'bg-orange-500' },
  { key: 'ready', label: 'Ready for Delivery', icon: PackageCheck, color: 'bg-green-500' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'bg-purple-500' },
]

const AGGREGATORS = [
  { key: 'careem', label: 'Careem NOW', color: 'bg-green-600' },
  { key: 'talabat', label: 'Talabat', color: 'bg-orange-500' },
  { key: 'deliveroo', label: 'Deliveroo', color: 'bg-teal-500' },
  { key: 'website', label: 'Website', color: 'bg-blue-600' },
  { key: 'pos', label: 'Walk-in', color: 'bg-gray-600' },
]

export default function KDSPage() {
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [lastOrderCount, setLastOrderCount] = useState(0)
  const [branchInfo, setBranchInfo] = useState({ name: 'Bam Burgers', branch: 'Salwa' })
  const [newOrderData, setNewOrderData] = useState({
    customer_name: '',
    customer_phone: '',
    order_type: 'dine_in',
    channel: 'pos',
    notes: ''
  })
  const [savingOrder, setSavingOrder] = useState(false)
  const [printingOrder, setPrintingOrder] = useState(null)
  const audioRef = useRef(null)
  const { toast } = useToast()

  // Fetch orders from Supabase
  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('tenant_id', TENANT_ID)
        .not('status', 'in', '(completed,cancelled)')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Play buzzer if new orders detected
      if (data.length > lastOrderCount && lastOrderCount > 0 && soundEnabled) {
        playBuzzer()
      }
      setLastOrderCount(data.length)
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [lastOrderCount, soundEnabled])

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        supabase.from('items').select('*').eq('tenant_id', TENANT_ID).eq('status', 'active').order('sort_order'),
        supabase.from('categories').select('*').eq('tenant_id', TENANT_ID).order('sort_order')
      ])
      
      if (itemsRes.data) setMenuItems(itemsRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }

  // Fetch branch info
  const fetchBranchInfo = async () => {
    try {
      const { data } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', TENANT_ID)
        .single()
      
      if (data) setBranchInfo({ name: data.name || 'Bam Burgers', branch: 'Salwa' })
    } catch (error) {
      console.error('Error fetching branch:', error)
    }
  }

  // Play buzzer sound
  const playBuzzer = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }
    toast({
      title: '🔔 New Order!',
      description: 'A new order has arrived',
      className: 'bg-green-500 text-white border-green-600'
    })
  }

  // Setup Supabase Realtime subscription
  useEffect(() => {
    fetchOrders()
    fetchMenuItems()
    fetchBranchInfo()

    // Set up realtime subscription
    const channel = supabase
      .channel('kds-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${TENANT_ID}`
        },
        (payload) => {
          console.log('Realtime update:', payload)
          if (payload.eventType === 'INSERT' && soundEnabled) {
            playBuzzer()
          }
          fetchOrders()
        }
      )
      .subscribe()

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchOrders, 5000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [soundEnabled])

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Add timestamps for specific statuses
      if (newStatus === 'accepted') updateData.accepted_at = new Date().toISOString()
      if (newStatus === 'ready') updateData.ready_at = new Date().toISOString()
      if (newStatus === 'out_for_delivery') updateData.dispatched_at = new Date().toISOString()
      if (newStatus === 'completed') updateData.completed_at = new Date().toISOString()

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error

      toast({ title: 'Status Updated', description: `Order moved to ${newStatus.replace('_', ' ')}` })
      fetchOrders()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' })
    }
  }

  // Cart functions
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id)
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const updateCartQty = (itemId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter(c => c.id !== itemId))
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity: qty } : c))
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.base_price * item.quantity), 0)

  // Create new order
  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please add items to the order' })
      return
    }

    setSavingOrder(true)
    try {
      const response = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrderData,
          items: cart.map(item => ({
            item_id: item.id,
            item_name_en: item.name_en,
            item_name_ar: item.name_ar,
            quantity: item.quantity,
            unit_price: item.base_price,
            total_price: item.base_price * item.quantity
          })),
          subtotal: cartTotal,
          total_amount: cartTotal
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: 'Order Created!', description: `Order ${data.data.order_number} has been placed` })
        setCreateOrderOpen(false)
        setCart([])
        setNewOrderData({ customer_name: '', customer_phone: '', order_type: 'dine_in', channel: 'pos', notes: '' })
        if (soundEnabled) playBuzzer()
        fetchOrders()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create order' })
    }
    setSavingOrder(false)
  }

  // Print order receipt (Bam Burgers format)
  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    const orderDate = new Date(order.created_at)
    const formattedDate = orderDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const formattedTime = orderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    
    const items = order.order_items || []
    let itemsHTML = items.map(item => `
      <tr>
        <td class="item-name">
          ${item.item_name_en}<br>
          <span class="arabic">${item.item_name_ar || ''}</span>
        </td>
        <td class="center">${item.quantity}</td>
        <td class="right">${item.unit_price?.toFixed(3)}</td>
        <td class="right">${item.total_price?.toFixed(3)}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            width: 80mm; 
            margin: 0 auto; 
            padding: 10mm 5mm;
            font-size: 12px;
          }
          .header { text-align: center; margin-bottom: 15px; }
          .logo { font-family: 'Impact', sans-serif; font-size: 36px; font-weight: bold; }
          .branch { margin: 5px 0; }
          .bill-info { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
          .bill-row { display: flex; justify-content: space-between; margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; font-size: 11px; }
          td { padding: 5px 0; vertical-align: top; font-size: 11px; }
          .center { text-align: center; }
          .right { text-align: right; }
          .arabic { font-size: 10px; color: #555; direction: rtl; }
          .item-name { width: 50%; }
          .total-section { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
          .grand-total { 
            font-size: 16px; 
            font-weight: bold; 
            text-align: center; 
            margin: 15px 0;
            border-top: 2px solid #000;
            padding-top: 10px;
          }
          .grand-total-ar { direction: rtl; font-size: 14px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 15px; font-size: 10px; color: #666; }
          @media print {
            body { width: 80mm; }
            @page { size: 80mm auto; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Bam</div>
          <div class="branch">${branchInfo.name}</div>
          <div class="branch">${branchInfo.branch}</div>
          <div>${formattedDate} ${formattedTime}</div>
        </div>
        
        <div class="bill-info">
          <div class="bill-row"><span>Quick Bill</span><span>User: ${order.channel || 'pos'}</span></div>
          <div class="bill-row"><strong>Bill No: ${order.order_number?.replace('ORD-', '')}</strong></div>
          <div class="bill-row"><span>Pay Mode:</span><span>${order.payment_method || 'Cash'}</span></div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item / غرض</th>
              <th class="center">Qty<br>الكمية</th>
              <th class="right">Rate<br>السعر</th>
              <th class="right">Total<br>الاجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="bill-row"><span>Total:</span><span>${items.reduce((s, i) => s + i.quantity, 0)}</span><span>د.ك ${order.total_amount?.toFixed(3)}</span></div>
        </div>
        
        <div class="grand-total">
          Grand Total<br>
          د.ك ${order.total_amount?.toFixed(3)} : المجموع الإجمالي
        </div>
        
        <div class="footer">
          Powered by RIWA POS v1.0<br>
          Thank you for your order!
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Get status index for progress
  const getStatusIndex = (status) => {
    const idx = ORDER_STATUSES.findIndex(s => s.key === status)
    return idx >= 0 ? idx : 0
  }

  // Get next status
  const getNextStatus = (currentStatus) => {
    const idx = getStatusIndex(currentStatus)
    if (idx < ORDER_STATUSES.length - 1) {
      return ORDER_STATUSES[idx + 1].key
    }
    return 'completed'
  }

  // Get channel badge
  const getChannelBadge = (channel) => {
    const agg = AGGREGATORS.find(a => a.key === channel)
    return agg ? (
      <Badge className={`${agg.color} text-white`}>{agg.label}</Badge>
    ) : (
      <Badge variant="outline">{channel}</Badge>
    )
  }

  // Get elapsed time
  const getElapsedTime = (createdAt) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diff = Math.floor((now - created) / 1000 / 60)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`
  }

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(i => i.category_id === selectedCategory)

  // Group orders by status
  const groupedOrders = ORDER_STATUSES.reduce((acc, status) => {
    acc[status.key] = orders.filter(o => o.status === status.key || (status.key === 'placed' && o.status === 'created'))
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Toaster />
      
      {/* Hidden audio element for buzzer */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAgAQIzK9OqASAIqP4HY/O17EAgqNI3Z/fN8DQovJI3e9fR/EAosE4nm8vODEwosCIHt8vGHFgooAXr27fGKGAojAHH57u+NGgoh/2n76e2QGwof/WH96OyTHAkd+1n/5uuVHQgb+VH/5OqXHggZ9kj/4umZHwcX9D7/4OiaIAYV8jT+3uebIQUT7yr93OacIgMR6iD82uWeIwIP5hf72OSfJAEN4g751uOhJQAL3gb40OKiJgAI2gD2zuCjJwAF1wDzzd+kKAAC0wDwy96lKQAA0ADtyd2mKgABzQDqx9unKwADygDnxdqoLAAFxwDjw9mpLQAHxADgwdiqLgAJwQDdv9erLwALvgDavNSsMAANuwDYutOtMQAPuADVuNGuMgARtQDSts+vMwATsgDPtM6wNAAVrwDMss2xNQAXrADJsMyyNgAZqQDGrsuznwAboADFrMu0oAAemADDq8q1oQAhkADBqsm2ogAjhwC/qci3owAmfgC9qMe4pAAodQC7p8a5pQAqbAC5psW6pgAtYwC3pcS7pwAvWgC1pMO8qAAxUQCzo8K9qQA0SAGxosG+qgA2PwGvoMDAqwA4NgGtnr+/rAA7LQGrnb6+rQA9JAGpm72+rgBAABuombyArgBDABKmlru8rwBFAAmnlLq7sABIAAWlkrm6sQBLAAKjkLi5sgBOAAChj7e4swBQAAefj7a3swBTAAadj7W2tABWAASbjrS1tQBZAAGajLS0tgBbAACZjLOztgBdAACYjLKytwBgAACXjLGxuABjAACWi7CwuQBmAACVi6+vuQBoAACUi66uugBrAACTi62tugBtAACRiq2svABwAACQiqyrvQBzAACPiaqqvQB1AACOiamqvgB4AACNiaiowAB7AACMiKeowQB9AACLiKanwgCAAAGKh6WmwwCDAASJh6SlxACFAAmIhqOkxQCIAA6Hh6KjxgCKABOGh6GixwCNABiFhqChyACQAB2FhZ+gyQCSACKEhZ6fyQCVACiDhJ2eygCXAC2DhJydzACaADKChJuczQCcADiBg5qbzgCfAD2BgpmZzwCiAEKAgZiY0AClAEd/gJeX0QCnAEt/f5aW0gCqAFB+fpWV0wCsAFV+fpSU1ACvAFl9fZOT1QCyAF19fJKS1gC0AGJ8e5GR1wC3AGZ8e5CQ2AC5AGl7epCQ2QC8AG17eY+P2gC/AHB6eI6O2wDBAHR5d42N3ADEAHZ5d4yM3QDHAHZ4d4uL3gDJAHd4doqK3wDMAHh3dYmJ4ADOAHZ2dIiI4QDRAHN2c4eH4gDTAHF1c4aG4wDVAG90coWF5ADXAG1zcYSE5QDZAGpycIOD5gDbAGdxb4KC5wDdAGRwboGB6ADeAGFvbYCA6QDgAF5ua3+A6gDiAFttaX5+6wDjAFhsaH196ADlAFVqZnx77wDmAFJpZXt6+QDoAE9oZHp5/gDqAEtnYnl4/gDrAEhmYXh3/gDsAEVlYHd2/gDuAEJkX3Z1/gDvAD9jXnV0/gDwADxiXXRz/gDxADlhXHNy/gDzADZgW3Jx/gD0ADNfWnFw/gD1ADBeWXBv/gD2AC1dWG9u/gD3ACpcV25t/gD4ACdbVm1s/gD5ACRaVWxr/gD6ACFZVGtq/gD7AB5YU2pp/gD8ABtXUmlp/gD8ABhWUWhp/wD9ABVVT2do/wD+ABJUTmZn/wD/AA9TTWVm/wAAAQxSTGRl/wAAAQlRTGNk/wABAgdQS2Jj/wABAgRPSmFi/wACAwFOSWBh/wACAwBOSWBg/wADAwBNSF9f/wADBAAMR15e/wAEBABLRl1d/wAEBQBKRlxc/wAFBQBJRVtb/wAFBgBIRFpa/wAGBgBHRFlZ/wAGBwBGQ1hY/wAHBwBFQ1dX/wAHCABEQlZW/wAICABDQVVV/wAICABCQVRU/wAJCQBBQFNT/wAJCgBAPxJS/wAKCgA/Pw=="type="audio/wav" />
      </audio>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#d4af37] rounded-xl flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display System</h1>
            <p className="text-gray-400 text-sm">Auto-refresh: 5 seconds | Realtime enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={soundEnabled ? 'default' : 'outline'}
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600'}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setCreateOrderOpen(true)}
            className="bg-[#d4af37] hover:bg-[#c4a030] text-black font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Push Order
          </Button>
        </div>
      </div>

      {/* Status Columns */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ORDER_STATUSES.map((status) => (
            <div key={status.key} className="flex flex-col">
              <div className={`${status.color} rounded-t-lg px-4 py-3 flex items-center gap-2`}>
                <status.icon className="h-5 w-5" />
                <span className="font-semibold">{status.label}</span>
                <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                  {groupedOrders[status.key]?.length || 0}
                </Badge>
              </div>
              <ScrollArea className="flex-1 bg-gray-800 rounded-b-lg p-2 min-h-[500px] max-h-[70vh]">
                <div className="space-y-3">
                  {groupedOrders[status.key]?.map((order) => (
                    <Card key={order.id} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg text-white">#{order.order_number?.replace('ORD-', '')}</span>
                          {getChannelBadge(order.channel)}
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {getElapsedTime(order.created_at)}
                        </div>
                        
                        {/* Order Items */}
                        <div className="space-y-1 mb-3">
                          {order.order_items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-300">
                                {item.quantity}x {item.item_name_en}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-right font-bold text-[#d4af37] mb-3">
                          {order.total_amount?.toFixed(3)} KWD
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-600"
                            onClick={() => printReceipt(order)}
                          >
                            <Printer className="h-3 w-3 mr-1" />
                            Print
                          </Button>
                          {status.key !== 'out_for_delivery' && (
                            <Button
                              size="sm"
                              className="flex-1 bg-[#1e3a5f] hover:bg-[#152a45]"
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status === 'created' ? 'placed' : order.status))}
                            >
                              Next →
                            </Button>
                          )}
                          {status.key === 'out_for_delivery' && (
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                            >
                              Complete ✓
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!groupedOrders[status.key] || groupedOrders[status.key].length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      No orders
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      )}

      {/* Create Order Dialog */}
      <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-[#d4af37]">Push New Order</DialogTitle>
            <DialogDescription className="text-gray-400">Add items and select order source</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Menu Items */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex gap-2 mb-3 flex-wrap">
                <Button size="sm" variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className={selectedCategory === 'all' ? 'bg-[#d4af37] text-black' : 'border-gray-600'}
                  onClick={() => setSelectedCategory('all')}>All</Button>
                {categories.map(cat => (
                  <Button key={cat.id} size="sm" variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    className={selectedCategory === cat.id ? 'bg-[#d4af37] text-black' : 'border-gray-600'}
                    onClick={() => setSelectedCategory(cat.id)}>{cat.name_en}</Button>
                ))}
              </div>
              <ScrollArea className="flex-1 pr-2">
                <div className="grid grid-cols-2 gap-2">
                  {filteredItems.map(item => (
                    <div key={item.id} onClick={() => addToCart(item)}
                      className="p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:border-[#d4af37]">
                      <p className="font-medium text-sm truncate text-white">{item.name_en}</p>
                      <p className="text-xs text-gray-400 truncate" dir="rtl">{item.name_ar}</p>
                      <p className="text-[#d4af37] font-bold mt-1">{item.base_price?.toFixed(3)} KWD</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Cart & Order Info */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto">
                <h4 className="font-semibold mb-2 text-[#d4af37]">Order Items ({cart.length})</h4>
                {cart.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{item.name_en}</p>
                          <p className="text-xs text-gray-400">{item.base_price?.toFixed(3)} KWD each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-gray-500"
                            onClick={() => updateCartQty(item.id, item.quantity - 1)}>-</Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-gray-500"
                            onClick={() => updateCartQty(item.id, item.quantity + 1)}>+</Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-lg border-t border-gray-600 pt-2">
                      <span>Total</span>
                      <span className="text-[#d4af37]">{cartTotal.toFixed(3)} KWD</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-4">Click items to add to order</p>
                )}

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-400">Order Source (Aggregator)</Label>
                    <Select value={newOrderData.channel} onValueChange={v => setNewOrderData({...newOrderData, channel: v})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {AGGREGATORS.map(agg => (
                          <SelectItem key={agg.key} value={agg.key}>{agg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-400">Customer Name (Optional)</Label>
                      <Input value={newOrderData.customer_name} placeholder="Walk-in"
                        className="bg-gray-700 border-gray-600"
                        onChange={e => setNewOrderData({...newOrderData, customer_name: e.target.value})} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Phone (Optional)</Label>
                      <Input value={newOrderData.customer_phone} placeholder="+965"
                        className="bg-gray-700 border-gray-600"
                        onChange={e => setNewOrderData({...newOrderData, customer_phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Order Type</Label>
                    <Select value={newOrderData.order_type} onValueChange={v => setNewOrderData({...newOrderData, order_type: v})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="dine_in">Dine In</SelectItem>
                        <SelectItem value="takeaway">Takeaway</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Notes (Optional)</Label>
                    <Textarea value={newOrderData.notes} placeholder="Special instructions..."
                      className="bg-gray-700 border-gray-600"
                      onChange={e => setNewOrderData({...newOrderData, notes: e.target.value})} rows={2} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOrderOpen(false)} className="border-gray-600">
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={savingOrder || cart.length === 0}
              className="bg-[#d4af37] hover:bg-[#c4a030] text-black font-semibold">
              {savingOrder ? 'Creating...' : `Create Order (${cartTotal.toFixed(3)} KWD)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
