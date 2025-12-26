import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bam-manager.preview.emergentagent.com'

// Get MyFatoorah configuration from tenant settings
async function getMyFatoorahConfig() {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('settings')
    .eq('id', TENANT_ID)
    .single()
  
  return tenant?.settings?.integrations?.myfatoorah
}

// Create payment invoice
export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      order_id,
      amount,
      customer_name,
      customer_email,
      customer_mobile,
      payment_method_id,
      items
    } = body
    
    const config = await getMyFatoorahConfig()
    if (!config?.enabled || !config?.config?.api_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'MyFatoorah payment not configured' 
      }, { status: 400 })
    }

    const baseUrl = config.config.environment === 'live'
      ? 'https://api.myfatoorah.com'
      : 'https://apitest.myfatoorah.com'

    const payload = {
      PaymentMethodId: payment_method_id || 2, // Default to VISA/MC
      InvoiceValue: amount,
      CustomerName: customer_name,
      CustomerEmail: customer_email,
      CustomerMobile: customer_mobile,
      DisplayCurrencyIso: 'KWD',
      MobileCountryCode: '965',
      Language: 'EN',
      CustomerReference: order_id,
      CallBackUrl: `${BASE_URL}/api/payments/myfatoorah/callback?order_id=${order_id}`,
      ErrorUrl: `${BASE_URL}/api/payments/myfatoorah/callback?order_id=${order_id}&status=error`,
    }

    // Add invoice items if provided
    if (items && items.length > 0) {
      payload.InvoiceItems = items.map(item => ({
        ItemName: item.name,
        Quantity: item.quantity,
        UnitPrice: item.unit_price
      }))
    }

    const response = await fetch(`${baseUrl}/v2/ExecutePayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.IsSuccess) {
      return NextResponse.json({
        success: true,
        data: {
          invoice_id: data.Data.InvoiceId,
          payment_url: data.Data.PaymentURL,
          customer_reference: data.Data.CustomerReference
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.Message || 'Failed to create payment'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('MyFatoorah create payment error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create payment' 
    }, { status: 500 })
  }
}

// Get payment methods
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const invoice_id = searchParams.get('invoice_id')
    
    const config = await getMyFatoorahConfig()
    if (!config?.enabled || !config?.config?.api_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'MyFatoorah payment not configured' 
      }, { status: 400 })
    }

    const baseUrl = config.config.environment === 'live'
      ? 'https://api.myfatoorah.com'
      : 'https://apitest.myfatoorah.com'

    // If invoice_id provided, get payment status
    if (invoice_id) {
      const response = await fetch(`${baseUrl}/v2/GetPaymentStatus`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Key: invoice_id, KeyType: 'InvoiceId' })
      })

      const data = await response.json()

      if (data.IsSuccess) {
        return NextResponse.json({
          success: true,
          data: {
            invoice_id: data.Data.InvoiceId,
            invoice_status: data.Data.InvoiceStatus,
            invoice_value: data.Data.InvoiceValue,
            customer_reference: data.Data.CustomerReference,
            transactions: data.Data.InvoiceTransactions?.map(t => ({
              transaction_id: t.TransactionId,
              payment_id: t.PaymentId,
              payment_gateway: t.PaymentGateway,
              transaction_status: t.TransactionStatus,
              transaction_value: t.TransactionValue,
              paid_currency: t.PaidCurrency,
              paid_at: t.TransactionDate
            }))
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: data.Message
        }, { status: 400 })
      }
    }

    // Get available payment methods
    const response = await fetch(`${baseUrl}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        InvoiceAmount: 1,
        CurrencyIso: 'KWD'
      })
    })

    const data = await response.json()

    if (data.IsSuccess) {
      return NextResponse.json({
        success: true,
        data: {
          payment_methods: data.Data.PaymentMethods.map(m => ({
            id: m.PaymentMethodId,
            name: m.PaymentMethodEn,
            name_ar: m.PaymentMethodAr,
            image: m.ImageUrl,
            service_charge: m.ServiceCharge,
            currency: m.CurrencyIso,
            is_direct: m.IsDirectPayment
          }))
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.Message
      }, { status: 400 })
    }
  } catch (error) {
    console.error('MyFatoorah API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch data' 
    }, { status: 500 })
  }
}
