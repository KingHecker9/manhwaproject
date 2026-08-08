import { createClient } from '@supabase/supabase-js'
console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('ANON KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('ANON KEY (partial):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20));

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)