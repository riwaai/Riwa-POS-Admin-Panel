import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching coupons:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Coupons API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      usage_per_customer,
      valid_from,
      valid_until,
      status
    } = body

    if (!code || !discount_value) {
      return NextResponse.json({ success: false, error: 'Code and discount value are required' }, { status: 400 })
    }

    // Check if coupon code already exists
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('tenant_id', TENANT_ID)
      .eq('code', code.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 })
    }

    const newCoupon = {
      id: uuidv4(),
      tenant_id: TENANT_ID,
      code: code.toUpperCase(),
      description: description || null,
      discount_type: discount_type || 'percentage',
      discount_value: parseFloat(discount_value),
      min_order_amount: min_order_amount ? parseFloat(min_order_amount) : null,
      max_discount: max_discount ? parseFloat(max_discount) : null,
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      usage_per_customer: usage_per_customer ? parseInt(usage_per_customer) : 1,
      times_used: 0,
      valid_from: valid_from || null,
      valid_until: valid_until || null,
      status: status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert([newCoupon])
      .select()
      .single()

    if (error) {
      console.error('Error creating coupon:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create coupon error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create coupon' }, { status: 500 })
  }
}
