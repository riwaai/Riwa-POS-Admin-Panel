import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Get today's orders
    const { data: todayOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status')
      .eq('tenant_id', TENANT_ID)
      .gte('created_at', todayISO)

    if (ordersError) {
      console.error('Error fetching today orders:', ordersError)
    }

    // Calculate stats
    const todayOrdersCount = todayOrders?.length || 0
    const todaySales = todayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const pendingOrders = todayOrders?.filter(o => ['created', 'accepted', 'preparing'].includes(o.status)).length || 0

    // Get total items count
    const { count: totalItems } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', TENANT_ID)
      .eq('status', 'active')

    // Get recent 10 orders
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total_amount, status, created_at')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('Error fetching recent orders:', recentError)
    }

    // Get weekly sales data (last 7 days)
    const weeklyData = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const { data: dayOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('tenant_id', TENANT_ID)
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())
        .neq('status', 'cancelled')
      
      const daySales = dayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      
      weeklyData.push({
        name: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        sales: daySales,
        orders: dayOrders?.length || 0
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        todayOrders: todayOrdersCount,
        todaySales: todaySales,
        pendingOrders: pendingOrders,
        totalItems: totalItems || 0
      },
      recentOrders: recentOrders || [],
      weeklySales: weeklyData
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
