import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format, eachDayOfInterval, parseISO } from 'date-fns'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json({ success: false, error: 'Date range required' }, { status: 400 })
    }

    // Get all orders in range
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json({ success: false, error: ordersError.message }, { status: 500 })
    }

    // Get order items for the period
    const orderIds = orders?.map(o => o.id) || []
    let orderItems = []
    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds)
      orderItems = items || []
    }

    // Get items for names
    const { data: menuItems } = await supabase
      .from('items')
      .select('id, name_en, category_id')
      .eq('tenant_id', TENANT_ID)

    // Get categories for names
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name_en')
      .eq('tenant_id', TENANT_ID)

    // Get new customers in period
    const { data: newCustomers } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', TENANT_ID)
      .gte('created_at', from)
      .lte('created_at', to)

    // Calculate summary
    const totalOrders = orders?.length || 0
    const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
    const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0
    const pendingOrders = orders?.filter(o => ['created', 'accepted', 'preparing', 'ready'].includes(o.status)).length || 0
    const totalSales = orders?.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
    const avgOrderValue = totalOrders > 0 ? totalSales / (totalOrders - cancelledOrders || 1) : 0

    // Daily sales breakdown
    const fromDate = parseISO(from)
    const toDate = parseISO(to)
    const days = eachDayOfInterval({ start: fromDate, end: toDate })
    
    const dailySales = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayOrders = orders?.filter(o => {
        const orderDate = format(new Date(o.created_at), 'yyyy-MM-dd')
        return orderDate === dayStr && o.status !== 'cancelled'
      }) || []
      const sales = dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      return {
        date: format(day, 'MMM d'),
        fullDate: dayStr,
        orders: dayOrders.length,
        sales: sales,
        avgOrder: dayOrders.length > 0 ? sales / dayOrders.length : 0
      }
    })

    // Orders by status
    const ordersByStatus = [
      { name: 'Completed', value: completedOrders },
      { name: 'Cancelled', value: cancelledOrders },
      { name: 'Pending', value: pendingOrders }
    ].filter(s => s.value > 0)

    // Orders by channel
    const channelCounts = {}
    orders?.forEach(o => {
      const channel = o.channel || 'pos'
      channelCounts[channel] = (channelCounts[channel] || 0) + 1
    })
    const ordersByChannel = Object.entries(channelCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))

    // Orders by type
    const typeCounts = {}
    orders?.forEach(o => {
      const type = o.order_type || 'dine_in'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    const ordersByType = Object.entries(typeCounts).map(([name, value]) => ({
      name: name.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value
    }))

    // Top selling items
    const itemSales = {}
    orderItems.forEach(oi => {
      const itemId = oi.item_id
      if (!itemSales[itemId]) {
        const menuItem = menuItems?.find(mi => mi.id === itemId)
        const category = categories?.find(c => c.id === menuItem?.category_id)
        itemSales[itemId] = {
          id: itemId,
          name: oi.item_name_en || menuItem?.name_en || 'Unknown',
          category: category?.name_en || 'Uncategorized',
          quantity: 0,
          revenue: 0
        }
      }
      itemSales[itemId].quantity += oi.quantity || 0
      itemSales[itemId].revenue += oi.total_price || 0
    })
    
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalSales,
          avgOrderValue,
          completedOrders,
          cancelledOrders,
          pendingOrders,
          newCustomers: newCustomers?.length || 0
        },
        dailySales,
        orders: orders || [],
        ordersByStatus,
        ordersByChannel,
        ordersByType,
        topItems
      }
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate reports' }, { status: 500 })
  }
}
