const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8')
    console.log(`Running migration: ${filePath}`)
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('Migration error:', error)
      process.exit(1)
    }
    
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

const migrationFile = process.argv[2]
if (!migrationFile) {
  console.error('Usage: node run-migration.js <migration-file>')
  process.exit(1)
}

runMigration(migrationFile)
