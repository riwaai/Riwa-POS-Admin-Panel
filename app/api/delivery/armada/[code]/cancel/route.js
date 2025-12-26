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

// Cancel Armada delivery order
export async function POST(request, { params }) {
  try {
    const { code } = params
    
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

    const response = await fetch(`${baseUrl}/v0/deliveries/${code}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.config.api_key}`
      }
    })

    if (response.ok || response.status === 200) {
      return NextResponse.json({
        success: true,
        message: 'Delivery cancelled successfully'
      })
    } else {
      const data = await response.json()
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to cancel delivery'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Armada cancel delivery error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to cancel delivery' 
    }, { status: 500 })
  }
}
