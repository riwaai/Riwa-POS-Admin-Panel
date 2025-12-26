import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

// Armada delivery webhook handler
export async function POST(request) {
  try {
    const authorization = request.headers.get('authorization')
    const body = await request.json()
    
    console.log('Armada Webhook:', body)
    
    // Webhook payload from Armada
    const {
      code,
      orderStatus,
      trackingLink,
      driver,
      estimatedDistance,
      estimatedDuration
    } = body

    // You would typically find the order by the Armada delivery code
    // and update its delivery status
    // This requires storing the delivery_code when creating the delivery
    
    // Log the webhook for debugging
    console.log(`Armada delivery ${code} status changed to: ${orderStatus}`)
    
    // Map Armada status to internal delivery status
    const statusMap = {
      pending: 'pending',
      dispatched: 'driver_assigned',
      waiting_pack: 'driver_arrived',
      en_route: 'out_for_delivery',
      completed: 'delivered',
      canceled: 'cancelled',
      failed: 'failed'
    }

    const internalStatus = statusMap[orderStatus] || orderStatus

    // Here you would update the order's delivery status
    // This requires storing the delivery_code in orders table
    // Example:
    // await supabase
    //   .from('orders')
    //   .update({
    //     delivery_status: internalStatus,
    //     delivery_tracking_link: trackingLink,
    //     delivery_driver: driver,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('delivery_code', code)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Armada webhook error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
