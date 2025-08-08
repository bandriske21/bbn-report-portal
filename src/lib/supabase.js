import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// TEMP DEBUG (safe): log the URL and key length only
console.log('[ENV CHECK] URL:', supabaseUrl)
console.log('[ENV CHECK] Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
