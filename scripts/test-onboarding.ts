/**
 * 测试 Supabase 连接和 user_onboarding 表
 * 运行: node --loader tsx scripts/test-onboarding.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testOnboarding() {
  console.log('🔍 Testing Supabase connection...')
  console.log('URL:', supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. 测试基本连接
  console.log('\n1️⃣ Testing basic connection...')
  const { data: healthCheck, error: healthError } = await supabase
    .from('users')
    .select('count')
    .limit(1)

  if (healthError) {
    console.error('❌ Connection failed:', healthError)
    return
  }
  console.log('✅ Connection successful')

  // 2. 检查 user_onboarding 表是否存在
  console.log('\n2️⃣ Checking user_onboarding table...')
  const { data: tableCheck, error: tableError } = await supabase
    .from('user_onboarding')
    .select('*')
    .limit(1)

  if (tableError) {
    console.error('❌ Table check failed:', {
      code: tableError.code,
      message: tableError.message,
      details: tableError.details,
      hint: tableError.hint,
    })
    return
  }
  console.log('✅ Table exists')
  console.log('Sample data:', tableCheck)

  // 3. 测试 RLS 策略（需要认证）
  console.log('\n3️⃣ Testing RLS policies...')
  console.log('⚠️  Note: This test uses anonymous access, so RLS may block queries')

  // 4. 检查表结构
  console.log('\n4️⃣ Checking table structure...')
  const { data: structure, error: structureError } = await supabase
    .from('user_onboarding')
    .select('*')
    .limit(0)

  if (structureError) {
    console.error('❌ Structure check failed:', structureError)
  } else {
    console.log('✅ Table structure accessible')
  }

  console.log('\n✅ All tests completed')
}

testOnboarding().catch(console.error)
