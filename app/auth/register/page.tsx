// app/auth/register/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '../RegisterForm';
import { createServerClient } from '../../lib/supabase';
import '../../page.styles.css';

export default async function RegisterPage() {
  const supabase = createServerClient();
  
  // Проверяем авторизацию на сервере
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Если пользователь авторизован, перенаправляем на страницу чата
    redirect('/chat');
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <RegisterForm />
      </div>
    </div>
  );
}
