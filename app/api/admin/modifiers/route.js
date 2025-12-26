import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('modifiers')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching modifiers:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Modifiers API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch modifiers' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { modifier_group_id, name_en, name_ar, price, default_selected } = body

    if (!name_en || !modifier_group_id) {
      return NextResponse.json({ success: false, error: 'Name and group are required' }, { status: 400 })
    }

    const newModifier = {
      id: uuidv4(),
      modifier_group_id,
      name_en,
      name_ar: name_ar || null,
      price: price || 0,
      default_selected: default_selected || false,
      sort_order: 0,
      status: 'active',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('modifiers')
      .insert([newModifier])
      .select()
      .single()

    if (error) {
      console.error('Error creating modifier:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create modifier error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create modifier' }, { status: 500 })
  }
}
