import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const updateData = { ...body }
    delete updateData.id
    delete updateData.created_at

    const { data, error } = await supabase
      .from('modifiers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating modifier:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update modifier error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update modifier' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const { error } = await supabase
      .from('modifiers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting modifier:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete modifier error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete modifier' }, { status: 500 })
  }
}
