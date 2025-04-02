
import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise use placeholders for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
