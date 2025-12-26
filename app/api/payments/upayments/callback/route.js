import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

// UPayments callback handler
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const order_id = searchParams.get('order_id')
    const status = searchParams.get('status')
    const track_id = searchParams.get('track_id')
    const result = searchParams.get('result') // CAPTURED, NOT_CAPTURED, etc.
    
    // If cancelled
    if (status === 'cancelled') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancelled?order_id=${order_id}`)
    }

    // Check payment result
    if (result === 'CAPTURED') {
      // Payment successful - update order
      if (order_id) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_method: 'upayments',
            payment_reference: track_id,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', order_id)
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order_id=${order_id}`)
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?order_id=${order_id}&reason=${result}`)
    }
  } catch (error) {
    console.error('UPayments callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?message=Callback%20error`)
  }
}
