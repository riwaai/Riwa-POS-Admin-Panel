import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // Handle status-specific timestamps
    if (body.status === 'accepted') {
      updateData.accepted_at = new Date().toISOString()
    } else if (body.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    } else if (body.status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    }
    
    delete updateData.id
    delete updateData.tenant_id
    delete updateData.created_at

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
  }
}
