import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// UPayments webhook handler
export async function POST(request) {
  try {
    const body = await request.json()
    
    console.log('UPayments Webhook:', body)
    
    // UPayments webhook payload structure
    const { 
      track_id,
      payment_status,
      order_id,
      reference_id,
      result
    } = body
    
    const orderId = reference_id || order_id

    // Update order based on payment status
    if (orderId && (payment_status === 'success' || result === 'CAPTURED')) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_method: 'upayments',
          payment_reference: track_id,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('UPayments webhook error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
