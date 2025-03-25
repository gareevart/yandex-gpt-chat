// app/lib/supabaseClient.ts (альтернативный вариант)
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Клиент с настройками по умолчанию для компонентов
export const supabase = createClientComponentClient();

// Если нужны дополнительные опции аутентификации, используйте createClient
export const supabaseWithOptions = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
