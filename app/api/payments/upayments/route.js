import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bam-manager.preview.emergentagent.com'

// Get UPayments configuration from tenant settings
async function getUPaymentsConfig() {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('settings')
    .eq('id', TENANT_ID)
    .single()
  
  return tenant?.settings?.integrations?.upayments
}

// Create payment charge
export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      order_id,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      payment_gateway
    } = body
    
    const config = await getUPaymentsConfig()
    if (!config?.enabled || !config?.config?.api_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'UPayments not configured' 
      }, { status: 400 })
    }

    const baseUrl = config.config.environment === 'production'
      ? 'https://api.upayments.com'
      : 'https://sandboxapi.upayments.com'

    const payload = {
      merchant_id: config.config.merchant_id,
      order: {
        id: order_id,
        amount: amount,
        currency: 'KWD',
        description: `Order ${order_id}`
      },
      customer: {
        unique_id: customer_email || customer_phone,
        name: customer_name,
        email: customer_email,
        phone: customer_phone
      },
      payment_gateway: payment_gateway || 'knet', // knet, creditcard, samsung-pay, apple-pay
      language: 'en',
      reference: {
        id: order_id
      },
      return_url: `${BASE_URL}/api/payments/upayments/callback?order_id=${order_id}`,
      cancel_url: `${BASE_URL}/api/payments/upayments/callback?order_id=${order_id}&status=cancelled`,
      notification_url: `${BASE_URL}/api/payments/upayments/webhook`
    }

    const response = await fetch(`${baseUrl}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.status && data.data?.link) {
      return NextResponse.json({
        success: true,
        data: {
          payment_url: data.data.link,
          track_id: data.data.track_id,
          order_id: order_id
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to create payment'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('UPayments create charge error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create payment' 
    }, { status: 500 })
  }
}

// Get payment status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const track_id = searchParams.get('track_id')
    
    if (!track_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Track ID required' 
      }, { status: 400 })
    }

    const config = await getUPaymentsConfig()
    if (!config?.enabled || !config?.config?.api_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'UPayments not configured' 
      }, { status: 400 })
    }

    const baseUrl = config.config.environment === 'production'
      ? 'https://api.upayments.com'
      : 'https://sandboxapi.upayments.com'

    const response = await fetch(`${baseUrl}/api/v1/get-payment-status?track_id=${track_id}`, {
      headers: {
        'Authorization': `Bearer ${config.config.api_key}`
      }
    })

    const data = await response.json()

    if (data.status) {
      return NextResponse.json({
        success: true,
        data: {
          track_id: data.data.track_id,
          payment_status: data.data.payment_status,
          amount: data.data.amount,
          currency: data.data.currency,
          order_id: data.data.reference_id
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.message
      }, { status: 400 })
    }
  } catch (error) {
    console.error('UPayments get status error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get payment status' 
    }, { status: 500 })
  }
}
