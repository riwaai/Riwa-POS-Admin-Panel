import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name_en, name_ar, description_en, description_ar, sort_order } = body

    if (!name_en) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 })
    }

    const newCategory = {
      id: uuidv4(),
      tenant_id: TENANT_ID,
      name_en,
      name_ar: name_ar || null,
      description_en: description_en || null,
      description_ar: description_ar || null,
      sort_order: sort_order || 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([newCategory])
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  }
}
