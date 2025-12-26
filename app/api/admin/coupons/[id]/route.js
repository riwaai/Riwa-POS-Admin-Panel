import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }
    
    delete updateData.id
    delete updateData.tenant_id
    delete updateData.created_at
    delete updateData.times_used

    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating coupon:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update coupon error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting coupon:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete coupon error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete coupon' }, { status: 500 })
  }
}
