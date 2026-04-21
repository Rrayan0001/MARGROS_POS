import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const email = process.argv[2]
  console.log('Sending recovery email for:', email)
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  console.log('Result:', data, error)
}
test()
