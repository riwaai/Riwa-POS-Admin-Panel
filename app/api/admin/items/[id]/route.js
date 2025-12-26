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
    
    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData.tenant_id
    delete updateData.created_at

    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating item:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update item error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting item:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 })
  }
}
