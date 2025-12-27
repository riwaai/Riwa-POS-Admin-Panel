'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  Download,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

const COLORS = ['#1e3a5f', '#d4af37', '#a8c5e6', '#4ade80', '#f97316', '#8b5cf6']

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('this_week')
  const [reportData, setReportData] = useState(null)
  const { toast } = useToast()

  const getDateRange = () => {
    const now = new Date()
    switch (dateRange) {
      case 'today':
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return { from: today, to: now }
      case 'yesterday':
        const yesterday = subDays(now, 1)
        yesterday.setHours(0, 0, 0, 0)
        const yesterdayEnd = subDays(now, 1)
        yesterdayEnd.setHours(23, 59, 59, 999)
        return { from: yesterday, to: yesterdayEnd }
      case 'this_week':
        return { from: startOfWeek(now), to: now }
      case 'last_week':
        const lastWeekStart = startOfWeek(subDays(now, 7))
        const lastWeekEnd = endOfWeek(subDays(now, 7))
        return { from: lastWeekStart, to: lastWeekEnd }
      case 'this_month':
        return { from: startOfMonth(now), to: now }
      case 'last_month':
        const lastMonthStart = startOfMonth(subDays(now, 30))
        const lastMonthEnd = endOfMonth(subDays(now, 30))
        return { from: lastMonthStart, to: lastMonthEnd }
      case 'last_30_days':
        return { from: subDays(now, 30), to: now }
      default:
        return { from: startOfWeek(now), to: now }
    }
  }

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const { from, to } = getDateRange()
      const response = await fetch(`/api/admin/reports?from=${from.toISOString()}&to=${to.toISOString()}`)
      const data = await response.json()
      if (data.success) {
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load reports' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const downloadCSV = (type) => {
    if (!reportData) return
    
    let csvContent = ''
    let filename = ''
    const { from, to } = getDateRange()
    const dateStr = `${format(from, 'yyyy-MM-dd')}_to_${format(to, 'yyyy-MM-dd')}`
    
    switch (type) {
      case 'sales':
        csvContent = 'Date,Orders,Sales (KWD),Average Order Value\n'
        reportData.dailySales?.forEach(day => {
          csvContent += `${day.date},${day.orders},${day.sales.toFixed(2)},${day.avgOrder.toFixed(2)}\n`
        })
        filename = `sales_report_${dateStr}.csv`
        break
      case 'orders':
        csvContent = 'Order Number,Date,Customer,Type,Channel,Status,Amount (KWD)\n'
        reportData.orders?.forEach(order => {
          csvContent += `${order.order_number},${format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')},${order.customer_name || 'Walk-in'},${order.order_type},${order.channel},${order.status},${order.total_amount?.toFixed(2)}\n`
        })
        filename = `orders_report_${dateStr}.csv`
        break
      case 'items':
        csvContent = 'Item Name,Category,Quantity Sold,Revenue (KWD)\n'
        reportData.topItems?.forEach(item => {
          csvContent += `${item.name},${item.category},${item.quantity},${item.revenue.toFixed(2)}\n`
        })
        filename = `items_report_${dateStr}.csv`
        break
      case 'summary':
        csvContent = 'Metric,Value\n'
        csvContent += `Total Orders,${reportData.summary?.totalOrders}\n`
        csvContent += `Total Sales (KWD),${reportData.summary?.totalSales?.toFixed(2)}\n`
        csvContent += `Average Order Value (KWD),${reportData.summary?.avgOrderValue?.toFixed(2)}\n`
        csvContent += `Completed Orders,${reportData.summary?.completedOrders}\n`
        csvContent += `Cancelled Orders,${reportData.summary?.cancelledOrders}\n`
        csvContent += `New Customers,${reportData.summary?.newCustomers}\n`
        filename = `summary_report_${dateStr}.csv`
        break
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({ title: 'Downloaded', description: `${filename} has been downloaded` })
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
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Reports</h1>
          <p className="text-gray-500 text-sm">Business analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={fetchReportData}
            variant="outline"
            className="border-[#1e3a5f] text-[#1e3a5f]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">{reportData?.summary?.totalSales?.toFixed(2) || '0.00'} <span className="text-lg">KWD</span></p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">{reportData?.summary?.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">{reportData?.summary?.avgOrderValue?.toFixed(2) || '0.00'} <span className="text-lg">KWD</span></p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Customers</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">{reportData?.summary?.newCustomers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <Tabs defaultValue="sales">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="sales" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="items" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" />
            Items
          </TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#1e3a5f]">Sales Overview</CardTitle>
                <CardDescription>Daily sales performance</CardDescription>
              </div>
              <Button onClick={() => downloadCSV('sales')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData?.dailySales || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="sales" fill="#1e3a5f" radius={[4, 4, 0, 0]} name="Sales (KWD)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sales breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Completed Orders</p>
                  <p className="text-2xl font-bold text-green-600">{reportData?.summary?.completedOrders || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Cancelled Orders</p>
                  <p className="text-2xl font-bold text-red-600">{reportData?.summary?.cancelledOrders || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">{reportData?.summary?.pendingOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#1e3a5f]">Orders List</CardTitle>
                <CardDescription>All orders in selected period</CardDescription>
              </div>
              <Button onClick={() => downloadCSV('orders')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Order Status Pie Chart */}
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData?.ordersByStatus || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportData?.ordersByStatus?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Order Channels */}
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData?.ordersByChannel || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportData?.ordersByChannel?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Order Types */}
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData?.ordersByType || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportData?.ordersByType?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#1e3a5f] font-semibold">Order #</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Date</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Customer</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Channel</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Amount</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.orders?.slice(0, 20).map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(order.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>{order.customer_name || 'Walk-in'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{order.channel}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{order.total_amount?.toFixed(2)} KWD</TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportData?.orders?.length > 20 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Showing 20 of {reportData.orders.length} orders. Export CSV for full list.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#1e3a5f]">Top Selling Items</CardTitle>
                <CardDescription>Best performing menu items</CardDescription>
              </div>
              <Button onClick={() => downloadCSV('items')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#1e3a5f] font-semibold">#</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Item Name</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Category</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Qty Sold</TableHead>
                    <TableHead className="text-[#1e3a5f] font-semibold">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.topItems?.length > 0 ? (
                    reportData.topItems.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-400">#{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#a8c5e6]/20 text-[#1e3a5f]">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{item.quantity}</TableCell>
                        <TableCell className="font-semibold text-green-600">{item.revenue.toFixed(2)} KWD</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                        No item sales data for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Download All Reports */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1e3a5f]">Download Full Report</h3>
                <p className="text-sm text-gray-500">Export summary report with all data</p>
              </div>
            </div>
            <Button onClick={() => downloadCSV('summary')} className="bg-[#1e3a5f] hover:bg-[#152a45]">
              <Download className="h-4 w-4 mr-2" />
              Download Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
