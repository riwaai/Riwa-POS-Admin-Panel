import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'
const BRANCH_ID = process.env.BRANCH_ID || '3f9570b2-24d2-4f2d-81d7-25c6b35da76b'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('id', BRANCH_ID)
      .single()

    if (error) {
      console.error('Error fetching branch:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Branch API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch branch' }, { status: 500 })
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
    delete updateData.tenant_id
    delete updateData.created_at

    const { data, error } = await supabase
      .from('branches')
      .update(updateData)
      .eq('id', BRANCH_ID)
      .select()
      .single()

    if (error) {
      console.error('Error updating branch:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update branch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update branch' }, { status: 500 })
  }
}
