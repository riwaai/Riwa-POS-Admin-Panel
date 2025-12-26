'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Filter,
  Eye,
  Printer,
  RefreshCw,
  Calendar,
  ChevronDown,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Package
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { format } from 'date-fns'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [orderItems, setOrderItems] = useState([])
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const printRef = useRef(null)
  const { toast } = useToast()

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/orders?'
      if (statusFilter !== 'all') url += `status=${statusFilter}&`
      if (channelFilter !== 'all') url += `channel=${channelFilter}&`
      if (dateRange.from) url += `from=${dateRange.from.toISOString()}&`
      if (dateRange.to) url += `to=${dateRange.to.toISOString()}&`
      
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setOrders(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load orders' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, channelFilter, dateRange])

  const fetchOrderItems = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/items`)
      const data = await response.json()
      if (data.success) {
        setOrderItems(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching order items:', error)
    }
  }

  const openOrderDetails = async (order) => {
    setSelectedOrder(order)
    setOrderDetailsOpen(true)
    await fetchOrderItems(order.id)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Order status updated' })
        setSelectedOrder({ ...selectedOrder, status: newStatus })
        fetchOrders()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' })
    }
    setUpdatingStatus(false)
  }

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${selectedOrder?.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            h1 { font-size: 24px; text-align: center; margin-bottom: 10px; }
            h2 { font-size: 18px; margin: 15px 0 10px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .info { margin: 10px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
            .item { margin: 8px 0; }
            .item-name { font-weight: bold; }
            .item-price { float: right; }
            .totals { margin-top: 15px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bam Burgers</h1>
            <p>Order Receipt</p>
          </div>
          <div class="info">
            <div class="info-row"><span>Order #:</span><span>${selectedOrder?.order_number}</span></div>
            <div class="info-row"><span>Date:</span><span>${selectedOrder?.created_at ? format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm') : ''}</span></div>
            <div class="info-row"><span>Type:</span><span>${selectedOrder?.order_type}</span></div>
            <div class="info-row"><span>Channel:</span><span>${selectedOrder?.channel}</span></div>
            ${selectedOrder?.customer_name ? `<div class="info-row"><span>Customer:</span><span>${selectedOrder.customer_name}</span></div>` : ''}
            ${selectedOrder?.customer_phone ? `<div class="info-row"><span>Phone:</span><span>${selectedOrder.customer_phone}</span></div>` : ''}
          </div>
          <div class="items">
            <h2>Items</h2>
            ${orderItems.map(item => `
              <div class="item">
                <span class="item-name">${item.quantity}x ${item.item_name_en}</span>
                <span class="item-price">${item.total_price?.toFixed(2)} KWD</span>
              </div>
            `).join('')}
          </div>
          <div class="totals">
            <div class="total-row"><span>Subtotal:</span><span>${selectedOrder?.subtotal?.toFixed(2)} KWD</span></div>
            ${selectedOrder?.tax_amount > 0 ? `<div class="total-row"><span>Tax:</span><span>${selectedOrder.tax_amount?.toFixed(2)} KWD</span></div>` : ''}
            ${selectedOrder?.service_charge > 0 ? `<div class="total-row"><span>Service Charge:</span><span>${selectedOrder.service_charge?.toFixed(2)} KWD</span></div>` : ''}
            ${selectedOrder?.discount_amount > 0 ? `<div class="total-row"><span>Discount:</span><span>-${selectedOrder.discount_amount?.toFixed(2)} KWD</span></div>` : ''}
            <div class="total-row grand-total"><span>Total:</span><span>${selectedOrder?.total_amount?.toFixed(2)} KWD</span></div>
          </div>
          <div class="footer">
            <p>Thank you for your order!</p>
            <p>Bam Burgers - Salwa</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const filteredOrders = orders.filter(order => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return order.order_number?.toLowerCase().includes(query) ||
             order.customer_name?.toLowerCase().includes(query) ||
             order.customer_phone?.includes(query)
    }
    return true
  })

  const getStatusBadge = (status) => {
    const styles = {
      created: 'bg-blue-100 text-blue-700',
      accepted: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-orange-100 text-orange-700',
      ready: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return (
      <Badge className={`${styles[status] || 'bg-gray-100 text-gray-700'} capitalize`}>
        {status}
      </Badge>
    )
  }

  const getChannelBadge = (channel) => {
    const styles = {
      pos: 'bg-purple-100 text-purple-700',
      website: 'bg-blue-100 text-blue-700',
      talabat: 'bg-orange-100 text-orange-700',
      deliveroo: 'bg-teal-100 text-teal-700',
    }
    return (
      <Badge variant="outline" className={`${styles[channel] || 'bg-gray-100 text-gray-700'} capitalize`}>
        {channel}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Orders</h1>
          <p className="text-gray-500 text-sm">Manage and track all orders</p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order #, customer name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="talabat">Talabat</SelectItem>
                <SelectItem value="deliveroo">Deliveroo</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full lg:w-auto">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    'Date Range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
                <div className="p-3 border-t flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange({ from: null, to: null })}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#1e3a5f] font-semibold">Order #</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Customer</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Type</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Channel</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Amount</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Date</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{order.customer_name || 'Walk-in'}</p>
                            {order.customer_phone && (
                              <p className="text-xs text-gray-500">{order.customer_phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{order.order_type}</TableCell>
                        <TableCell>{getChannelBadge(order.channel)}</TableCell>
                        <TableCell className="font-semibold">{order.total_amount?.toFixed(2)} KWD</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {order.created_at ? format(new Date(order.created_at), 'MMM d, HH:mm') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openOrderDetails(order)}
                            className="text-[#1e3a5f]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-400 py-12">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f] flex items-center justify-between">
              <span>Order #{selectedOrder?.order_number}</span>
              {getStatusBadge(selectedOrder?.status)}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.created_at ? format(new Date(selectedOrder.created_at), 'MMMM d, yyyy HH:mm') : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6" ref={printRef}>
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-xs text-gray-500">Customer</Label>
                <p className="font-medium">{selectedOrder?.customer_name || 'Walk-in'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Phone</Label>
                <p className="font-medium">{selectedOrder?.customer_phone || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <p className="font-medium text-sm">{selectedOrder?.customer_email || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Order Type</Label>
                <p className="font-medium capitalize">{selectedOrder?.order_type}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-[#1e3a5f] mb-3">Order Items</h3>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.quantity}x {item.item_name_en}</p>
                      {item.item_name_ar && (
                        <p className="text-sm text-gray-500" dir="rtl">{item.item_name_ar}</p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-gray-400 mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                    <p className="font-semibold">{item.total_price?.toFixed(2)} KWD</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{selectedOrder?.subtotal?.toFixed(2)} KWD</span>
              </div>
              {selectedOrder?.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{selectedOrder?.tax_amount?.toFixed(2)} KWD</span>
                </div>
              )}
              {selectedOrder?.service_charge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Charge</span>
                  <span>{selectedOrder?.service_charge?.toFixed(2)} KWD</span>
                </div>
              )}
              {selectedOrder?.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{selectedOrder?.discount_amount?.toFixed(2)} KWD</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-[#1e3a5f]">{selectedOrder?.total_amount?.toFixed(2)} KWD</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs text-gray-500">Payment Status</Label>
              <Badge className={selectedOrder?.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                {selectedOrder?.payment_status?.toUpperCase()}
              </Badge>
            </div>

            {/* Update Status */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">Update Status</Label>
              <div className="flex flex-wrap gap-2">
                {['accepted', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={selectedOrder?.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateOrderStatus(selectedOrder?.id, status)}
                    disabled={updatingStatus || selectedOrder?.status === status}
                    className={selectedOrder?.status === status ? 'bg-[#1e3a5f]' : ''}
                  >
                    {status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {status === 'preparing' && <Clock className="h-3 w-3 mr-1" />}
                    {status === 'ready' && <Package className="h-3 w-3 mr-1" />}
                    {status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                    <span className="capitalize">{status}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOrderDetailsOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrint} className="bg-[#1e3a5f] hover:bg-[#152a45]">
              <Printer className="h-4 w-4 mr-2" />
              Print Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
