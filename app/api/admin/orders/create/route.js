import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use service role for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TENANT_ID = process.env.TENANT_ID || 'eatery-control-9'
const BRANCH_ID = process.env.BRANCH_ID || 'eatery-control-9'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      customer_name,
      customer_phone,
      customer_email,
      order_type,
      channel,
      notes,
      items,
      subtotal,
      total_amount,
      tax_amount = 0,
      discount_amount = 0,
      service_charge = 0,
      delivery_fee = 0
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must have at least one item' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`

    // Create order
    const orderId = uuidv4()
    const orderData = {
      id: orderId,
      tenant_id: TENANT_ID,
      branch_id: BRANCH_ID,
      order_number: orderNumber,
      customer_name: customer_name || 'Walk-in',
      customer_phone: customer_phone || null,
      customer_email: customer_email || null,
      order_type: order_type || 'dine_in',
      channel: channel || 'pos',
      status: 'placed',
      payment_status: 'pending',
      payment_method: 'cash',
      subtotal: parseFloat(subtotal) || 0,
      tax_amount: parseFloat(tax_amount) || 0,
      discount_amount: parseFloat(discount_amount) || 0,
      service_charge: parseFloat(service_charge) || 0,
      delivery_fee: parseFloat(delivery_fee) || 0,
      total_amount: parseFloat(total_amount) || 0,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { success: false, error: orderError.message },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map(item => ({
      id: uuidv4(),
      order_id: orderId,
      item_id: item.item_id,
      item_name_en: item.item_name_en,
      item_name_ar: item.item_name_ar || null,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price) || 0,
      total_price: parseFloat(item.total_price) || 0,
      modifiers: item.modifiers || null,
      notes: item.notes || null,
      created_at: new Date().toISOString()
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback order
      await supabase.from('orders').delete().eq('id', orderId)
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        order_items: orderItems
      }
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
