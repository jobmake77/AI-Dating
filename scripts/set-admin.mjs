import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setAdmin() {
  try {
    // Get the current user (you need to be logged in)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Not authenticated. Please log in first.')
      process.exit(1)
    }

    console.log(`📝 Current user: ${user.email}`)
    console.log(`🔑 User ID: ${user.id}`)

    // Update the user's role to admin
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)
      .select()

    if (error) {
      console.error('❌ Error updating role:', error)
      process.exit(1)
    }

    console.log('✅ Successfully updated role to admin!')
    console.log('🎉 You can now access /admin/users')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

setAdmin()
