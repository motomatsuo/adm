import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

let supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL não configurada no backend')
}

// Remove barra no final se existir
supabaseUrl = supabaseUrl.replace(/\/$/, '')

if (!supabaseServiceKey && !supabaseAnonKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY deve ser configurada no backend')
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey || '', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
