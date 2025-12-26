import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
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
    const updatedRewards = currentRewards.map(r => 
      r.id === id ? { ...r, ...body, updated_at: new Date().toISOString() } : r
    )

    const updatedSettings = {
      ...tenant?.settings,
      loyalty_rewards: updatedRewards
    }

    const { error } = await supabase
      .from('tenants')
      .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
      .eq('id', TENANT_ID)

    if (error) {
      console.error('Error updating reward:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { id, ...body } })
  } catch (error) {
    console.error('Update reward error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update reward' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
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
    const updatedRewards = currentRewards.filter(r => r.id !== id)

    const updatedSettings = {
      ...tenant?.settings,
      loyalty_rewards: updatedRewards
    }

    const { error } = await supabase
      .from('tenants')
      .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
      .eq('id', TENANT_ID)

    if (error) {
      console.error('Error deleting reward:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete reward error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete reward' }, { status: 500 })
  }
}
