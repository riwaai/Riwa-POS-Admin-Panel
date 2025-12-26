import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('modifier_groups')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching modifier groups:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Modifier groups API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch modifier groups' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name_en, name_ar, min_select, max_select, required } = body

    if (!name_en) {
      return NextResponse.json({ success: false, error: 'Group name is required' }, { status: 400 })
    }

    const newGroup = {
      id: uuidv4(),
      tenant_id: TENANT_ID,
      name_en,
      name_ar: name_ar || null,
      min_select: min_select || 0,
      max_select: max_select || 1,
      required: required || false,
      sort_order: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('modifier_groups')
      .insert([newGroup])
      .select()
      .single()

    if (error) {
      console.error('Error creating modifier group:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create modifier group error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create modifier group' }, { status: 500 })
  }
}
