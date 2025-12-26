import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

// MyFatoorah payment callback handler
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const order_id = searchParams.get('order_id')
    const status = searchParams.get('status')
    
    // Get MyFatoorah config
    const { data: tenant } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', TENANT_ID)
      .single()
    
    const config = tenant?.settings?.integrations?.myfatoorah
    
    if (!config?.config?.api_key) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?message=Payment%20not%20configured`)
    }

    // If error status, redirect to error page
    if (status === 'error') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?order_id=${order_id}`)
    }

    const baseUrl = config.config.environment === 'live'
      ? 'https://api.myfatoorah.com'
      : 'https://apitest.myfatoorah.com'

    // Get payment status from MyFatoorah
    const response = await fetch(`${baseUrl}/v2/GetPaymentStatus`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Key: paymentId, KeyType: 'PaymentId' })
    })

    const data = await response.json()

    if (data.IsSuccess && data.Data.InvoiceStatus === 'Paid') {
      // Update order payment status in database
      if (order_id) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_method: 'myfatoorah',
            payment_reference: paymentId,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', order_id)
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order_id=${order_id}`)
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?order_id=${order_id}`)
    }
  } catch (error) {
    console.error('MyFatoorah callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?message=Callback%20error`)
  }
}

// Webhook handler for MyFatoorah
export async function POST(request) {
  try {
    const body = await request.json()
    
    // MyFatoorah webhook payload
    const { InvoiceId, InvoiceStatus, CustomerReference, PaymentId } = body
    
    console.log('MyFatoorah Webhook:', { InvoiceId, InvoiceStatus, CustomerReference })

    // Update order based on CustomerReference (which contains order_id)
    if (CustomerReference && InvoiceStatus === 'Paid') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_method: 'myfatoorah',
          payment_reference: PaymentId || InvoiceId,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', CustomerReference)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('MyFatoorah webhook error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
