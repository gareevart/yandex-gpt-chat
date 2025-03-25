'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types'; // Вы можете сгенерировать типы с помощью Supabase CLI

// Создаем клиент для компонентов
export const supabase = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  options: {
    auth: {
      persistSession: true, // Убедитесь, что сессия сохраняется в локальном хранилище
      autoRefreshToken: true, // Автоматически обновлять токен
      detectSessionInUrl: true // Определять сессию из URL (для OAuth)
    }
  }
});
