import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id)

    if (error) {
      console.error('Error fetching order items:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Order items API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch order items' }, { status: 500 })
  }
}
