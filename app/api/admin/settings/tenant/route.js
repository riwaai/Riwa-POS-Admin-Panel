import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', TENANT_ID)
      .single()

    if (error) {
      console.error('Error fetching tenant:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Tenant API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tenant' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json()
    
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }
    
    delete updateData.id
    delete updateData.created_at

    const { data, error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', TENANT_ID)
      .select()
      .single()

    if (error) {
      console.error('Error updating tenant:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update tenant error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update tenant' }, { status: 500 })
  }
}
