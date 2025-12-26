import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', TENANT_ID)
      .single()

    if (error) {
      console.error('Error fetching integrations:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const integrations = tenant?.settings?.integrations || {}
    return NextResponse.json({ success: true, data: integrations })
  } catch (error) {
    console.error('Integrations API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch integrations' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { integration_id, category, enabled, config } = body

    // Get current tenant settings
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', TENANT_ID)
      .single()

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    // Update integrations
    const currentIntegrations = tenant?.settings?.integrations || {}
    const updatedIntegrations = {
      ...currentIntegrations,
      [integration_id]: {
        enabled,
        category,
        config,
        updated_at: new Date().toISOString()
      }
    }

    const updatedSettings = {
      ...tenant?.settings,
      integrations: updatedIntegrations
    }

    const { error } = await supabase
      .from('tenants')
      .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
      .eq('id', TENANT_ID)

    if (error) {
      console.error('Error saving integration:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save integration error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save integration' }, { status: 500 })
  }
}
