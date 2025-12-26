import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    // Try to get existing settings from tenant
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', TENANT_ID)
      .single()

    if (error) {
      console.error('Error fetching tenant:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Default loyalty settings
    const defaultSettings = {
      enabled: true,
      points_per_kwd: 10,
      points_value: 0.01,
      min_redemption_points: 100,
      max_redemption_percent: 50,
      welcome_bonus: 50
    }

    const loyaltySettings = tenant?.settings?.loyalty || defaultSettings

    return NextResponse.json({ success: true, data: loyaltySettings })
  } catch (error) {
    console.error('Loyalty settings API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Get current tenant settings
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', TENANT_ID)
      .single()

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    // Merge loyalty settings
    const updatedSettings = {
      ...tenant?.settings,
      loyalty: body
    }

    const { data, error } = await supabase
      .from('tenants')
      .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
      .eq('id', TENANT_ID)
      .select()
      .single()

    if (error) {
      console.error('Error saving loyalty settings:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    console.error('Save loyalty settings error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 })
  }
}
