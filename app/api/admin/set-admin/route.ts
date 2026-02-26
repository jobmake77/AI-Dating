import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Bootstrap endpoint: set the first admin.
// Requires ADMIN_BOOTSTRAP_SECRET in request body to prevent privilege escalation.
export async function POST(request: Request) {
  try {
    // Validate bootstrap secret
    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET
    if (!bootstrapSecret) {
      return NextResponse.json(
        { error: 'Bootstrap is disabled' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => ({}))
    if (body.secret !== bootstrapSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Role updated to admin',
      userId: user.id,
    })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
