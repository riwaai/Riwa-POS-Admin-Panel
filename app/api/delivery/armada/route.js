import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

// Get Armada configuration from tenant settings
async function getArmadaConfig() {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('settings')
    .eq('id', TENANT_ID)
    .single()
  
  return tenant?.settings?.integrations?.armada
}

// Create Armada delivery order
export async function POST(request) {
  try {
    const body = await request.json()
    const { order_id, customer, location, amount, payment_type } = body
    
    const config = await getArmadaConfig()
    if (!config?.enabled || !config?.config?.api_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Armada delivery not configured' 
      }, { status: 400 })
    }

    const baseUrl = config.config.environment === 'production'
      ? 'https://api.armadadelivery.com'
      : 'https://staging.api.armadadelivery.com'

    const headers = {
      'Authorization': `Key ${config.config.api_key}`,
      'Content-Type': 'application/json'
    }

    if (config.config.webhook_key) {
      headers['order-webhook-key'] = config.config.webhook_key
    }

    const deliveryPayload = {
      platformName: 'riwa_pos',
      platformData: {
        orderId: order_id,
        name: customer.name,
        phone: customer.phone,
        amount: amount.toString(),
        paymentType: payment_type || 'paid'
      }
    }

    // Add location (lat/lng) or address
    if (location.latitude && location.longitude) {
      deliveryPayload.platformData.location = {
        latitude: location.latitude,
        longitude: location.longitude
      }
    } else {
      // Kuwait address format
      deliveryPayload.platformData.area = location.area
      deliveryPayload.platformData.block = location.block
      deliveryPayload.platformData.street = location.street
      deliveryPayload.platformData.buildingNumber = location.building
      if (location.floor) deliveryPayload.platformData.floor = location.floor
      if (location.apartment) deliveryPayload.platformData.apartment = location.apartment
    }

    if (location.instructions) {
      deliveryPayload.platformData.instructions = location.instructions
    }

    const response = await fetch(`${baseUrl}/v0/deliveries`, {
      method: 'POST',
      headers,
      body: JSON.stringify(deliveryPayload)
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data: {
          delivery_code: data.code,
          delivery_fee: data.deliveryFee,
          status: data.orderStatus,
          estimated_distance: data.estimatedDistance,
          estimated_duration: data.estimatedDuration,
          tracking_link: data.trackingLink,
          qr_code_link: data.qrCodeLink,
          driver: data.driver
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to create delivery'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Armada create delivery error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create delivery order' 
    }, { status: 500 })
  }
}

// Get delivery status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Delivery code required' 
      }, { status: 400 })
    }

    const config = await getArmadaConfig()
    if (!config?.enabled || !config?.config?.api_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Armada delivery not configured' 
      }, { status: 400 })
    }

    const baseUrl = config.config.environment === 'production'
      ? 'https://api.armadadelivery.com'
      : 'https://staging.api.armadadelivery.com'

    const response = await fetch(`${baseUrl}/v0/deliveries/${code}`, {
      headers: {
        'Authorization': `Key ${config.config.api_key}`
      }
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data: {
          delivery_code: data.code,
          status: data.orderStatus,
          customer_address: data.customerAddress,
          tracking_link: data.trackingLink,
          driver: data.driver,
          estimated_distance: data.estimatedDistance,
          estimated_duration: data.estimatedDuration
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to get delivery status'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Armada get status error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get delivery status' 
    }, { status: 500 })
  }
}
