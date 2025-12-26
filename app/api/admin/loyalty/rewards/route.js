import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    // Get rewards from tenant settings or create default storage
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', TENANT_ID)
      .single()

    if (error) {
      console.error('Error fetching rewards:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const rewards = tenant?.settings?.loyalty_rewards || []
    return NextResponse.json({ success: true, data: rewards })
  } catch (error) {
    console.error('Loyalty rewards API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch rewards' }, { status: 500 })
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

    const currentRewards = tenant?.settings?.loyalty_rewards || []
    
    const newReward = {
      id: uuidv4(),
      ...body,
      created_at: new Date().toISOString()
    }

    const updatedSettings = {
      ...tenant?.settings,
      loyalty_rewards: [...currentRewards, newReward]
    }

    const { error } = await supabase
      .from('tenants')
      .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
      .eq('id', TENANT_ID)

    if (error) {
      console.error('Error creating reward:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: newReward })
  } catch (error) {
    console.error('Create reward error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create reward' }, { status: 500 })
  }
}
