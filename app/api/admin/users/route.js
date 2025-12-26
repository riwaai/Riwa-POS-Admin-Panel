import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const TENANT_ID = process.env.TENANT_ID || 'd82147fa-f5e3-474c-bb39-6936ad3b519a'
const BRANCH_ID = process.env.BRANCH_ID || '3f9570b2-24d2-4f2d-81d7-25c6b35da76b'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, role, pin, status } = body

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 })
    }

    const newUser = {
      id: uuidv4(),
      tenant_id: TENANT_ID,
      branch_id: BRANCH_ID,
      name,
      email,
      phone: phone || null,
      role: role || 'cashier',
      pin: pin || null,
      status: status || 'active',
      language: 'en',
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 })
  }
}
