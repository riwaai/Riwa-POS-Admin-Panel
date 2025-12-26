import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching items:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Items API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      category_id,
      name_en,
      name_ar,
      description_en,
      description_ar,
      base_price,
      sku,
      image_url,
      status
    } = body

    if (!name_en || !base_price || !category_id) {
      return NextResponse.json(
        { success: false, error: 'Name, price and category are required' },
        { status: 400 }
      )
    }

    const newItem = {
      id: uuidv4(),
      tenant_id: TENANT_ID,
      category_id,
      name_en,
      name_ar: name_ar || null,
      description_en: description_en || null,
      description_ar: description_ar || null,
      base_price: parseFloat(base_price),
      sku: sku || null,
      image_url: image_url || null,
      status: status || 'active',
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('items')
      .insert([newItem])
      .select()
      .single()

    if (error) {
      console.error('Error creating item:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create item error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 })
  }
}
