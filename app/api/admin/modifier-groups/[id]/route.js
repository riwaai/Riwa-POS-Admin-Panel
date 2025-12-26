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

    const { data, error } = await supabase
      .from('modifier_groups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating modifier group:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update modifier group error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update modifier group' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // First delete all modifiers in the group
    await supabase
      .from('modifiers')
      .delete()
      .eq('modifier_group_id', id)

    // Then delete the group
    const { error } = await supabase
      .from('modifier_groups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting modifier group:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete modifier group error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete modifier group' }, { status: 500 })
  }
}
