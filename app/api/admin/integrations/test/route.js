import { NextResponse } from 'next/server'

// Test integration connections
export async function POST(request) {
  try {
    const body = await request.json()
    const { integration_id, config } = body

    switch (integration_id) {
      case 'myfatoorah':
        return await testMyFatoorah(config)
      case 'upayments':
        return await testUPayments(config)
      case 'armada':
        return await testArmada(config)
      default:
        return NextResponse.json({ success: false, error: 'Unknown integration' }, { status: 400 })
    }
  } catch (error) {
    console.error('Test integration error:', error)
    return NextResponse.json({ success: false, error: 'Test failed' }, { status: 500 })
  }
}

// Test MyFatoorah connection
async function testMyFatoorah(config) {
  try {
    const baseUrl = config.environment === 'live' 
      ? 'https://api.myfatoorah.com' 
      : 'https://apitest.myfatoorah.com'
    
    // Use InitiatePayment to test - it's a lightweight call
    const response = await fetch(`${baseUrl}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.api_key}`,
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
        message: `Connected to MyFatoorah (${config.environment}). ${data.Data?.PaymentMethods?.length || 0} payment methods available.`
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.Message || 'Invalid API key or configuration'
      })
    }
  } catch (error) {
    console.error('MyFatoorah test error:', error)
    return NextResponse.json({ success: false, error: 'Failed to connect to MyFatoorah' })
  }
}

// Test UPayments connection
async function testUPayments(config) {
  try {
    const baseUrl = config.environment === 'production'
      ? 'https://api.upayments.com'
      : 'https://sandboxapi.upayments.com'
    
    // Test by getting payment methods
    const response = await fetch(`${baseUrl}/api/v1/get-payment-methods`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.api_key}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ 
        success: true, 
        message: `Connected to UPayments (${config.environment})`
      })
    } else {
      const error = await response.text()
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid API key or merchant ID'
      })
    }
  } catch (error) {
    console.error('UPayments test error:', error)
    return NextResponse.json({ success: false, error: 'Failed to connect to UPayments' })
  }
}

// Test Armada connection
async function testArmada(config) {
  try {
    const baseUrl = config.environment === 'production'
      ? 'https://api.armadadelivery.com'
      : 'https://staging.api.armadadelivery.com'
    
    // Test by making a simple authenticated request
    // Unfortunately Armada doesn't have a dedicated health check endpoint
    // We'll test by trying to get branches (should fail gracefully if no access)
    const response = await fetch(`${baseUrl}/v0/branches`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${config.api_key}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok || response.status === 200) {
      return NextResponse.json({ 
        success: true, 
        message: `Connected to Armada Delivery (${config.environment})`
      })
    } else if (response.status === 401) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid API key'
      })
    } else {
      // 404 or other errors might still mean the key is valid but no branches
      return NextResponse.json({ 
        success: true, 
        message: `Connected to Armada Delivery (${config.environment}). Configure branches in Armada dashboard.`
      })
    }
  } catch (error) {
    console.error('Armada test error:', error)
    return NextResponse.json({ success: false, error: 'Failed to connect to Armada' })
  }
}
